import { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';
import { calculateExpensesData } from '../services/expenses.service.js';
import { parseExpenseCSVServer } from '../utils/csvParser.js';

export const getExpenses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;

    const [user, transactions] = await Promise.all([
      User.findOne({ firebaseUid: userId }),
      Transaction.find({ userId }).sort({ date: -1 }),
    ]);

    const userBudget = user?.monthlyExpenses || 4200;
    const expenseData = calculateExpensesData(transactions, userBudget);

    res.status(200).json(expenseData);
  } catch (error) {
    next(error);
  }
};

export const uploadExpenseCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    let csvContent = '';

    if (req.body && req.body.csvData) {
      csvContent = req.body.csvData;
    } else if (req.file) {
      csvContent = req.file.buffer.toString('utf-8');
    } else {
      res.status(400).json({
        error: 'MISSING_CSV_DATA',
        message: 'Please provide csvData as string in request body or attach a file as "file".',
      });
      return;
    }

    const { transactions: parsedRows, errors } = parseExpenseCSVServer(csvContent);

    if (parsedRows.length === 0) {
      res.status(400).json({
        error: 'INVALID_CSV_DATA',
        message: 'No valid transaction records found in uploaded CSV.',
        errors,
      });
      return;
    }

    // Bulk insert transactions
    const docs = parsedRows.map((row) => ({
      userId,
      date: row.date,
      description: row.description,
      amount: row.amount,
      category: row.category,
    }));

    await Transaction.insertMany(docs);

    // Retrieve all transactions for the user to return updated calculations
    const allUserTx = await Transaction.find({ userId }).sort({ date: -1 });
    const user = await User.findOne({ firebaseUid: userId });
    const updatedData = calculateExpensesData(allUserTx, user?.monthlyExpenses || 4200);

    res.status(200).json({
      ...updatedData,
      insertedCount: docs.length,
      parseErrors: errors,
    });
  } catch (error) {
    next(error);
  }
};
