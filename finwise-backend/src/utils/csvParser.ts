import Papa from 'papaparse';

export const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#10B981', // Emerald / Blue
  Food: '#F59E0B', // Amber
  Groceries: '#84CC16', // Lime
  Transportation: '#3B82F6', // Blue
  Transport: '#3B82F6', // Blue
  Utilities: '#06B6D4', // Cyan
  Entertainment: '#EC4899', // Pink
  Shopping: '#8B5CF6', // Purple
  Health: '#EF4444', // Red
  Education: '#14B8A6', // Teal
  Travel: '#F97316', // Orange
  Other: '#64748B', // Slate
  Bills: '#06B6D4',
};

export interface ParsedTransactionRow {
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface ParseResult {
  transactions: ParsedTransactionRow[];
  errors: { row: number; error: string }[];
  totalParsed: number;
  validCount: number;
}

export const parseExpenseCSVServer = (csvText: string): ParseResult => {
  const parsed = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  const transactions: ParsedTransactionRow[] = [];
  const errors: { row: number; error: string }[] = [];

  parsed.data.forEach((row, idx) => {
    const rowNum = idx + 2; // header is row 1

    const dateKey = Object.keys(row).find((k) => /date/i.test(k)) || 'Date';
    const descKey = Object.keys(row).find((k) => /desc|merchant|item|title|name/i.test(k)) || 'Description';
    const amountKey = Object.keys(row).find((k) => /amount|price|cost|val/i.test(k)) || 'Amount';
    const catKey = Object.keys(row).find((k) => /cat|type/i.test(k)) || 'Category';

    const rawAmount = row[amountKey]?.replace(/[^0-9.-]+/g, '');
    const amount = Math.abs(parseFloat(rawAmount) || 0);
    const date = row[dateKey]?.trim() || new Date().toISOString().split('T')[0];
    const description = row[descKey]?.trim() || 'Uncategorized Expense';
    let category = row[catKey]?.trim() || 'Other';

    if (!rawAmount || isNaN(amount) || amount <= 0) {
      errors.push({ row: rowNum, error: `Invalid amount in row ${rowNum}: "${row[amountKey]}"` });
      return;
    }

    // Capitalize category properly
    if (category.length > 0) {
      category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      if (category === 'Dining' || category === 'Groceries' || category === 'Restaurants') category = 'Food';
      if (category === 'Transport') category = 'Transportation';
    } else {
      category = 'Other';
    }

    transactions.push({
      date,
      description,
      amount,
      category,
    });
  });

  return {
    transactions,
    errors,
    totalParsed: parsed.data.length,
    validCount: transactions.length,
  };
};
