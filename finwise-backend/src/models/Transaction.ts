import mongoose, { Document, Schema } from 'mongoose';

export type ExpenseCategory =
  | 'Housing'
  | 'Food'
  | 'Groceries'
  | 'Transportation'
  | 'Utilities'
  | 'Entertainment'
  | 'Shopping'
  | 'Health'
  | 'Education'
  | 'Travel'
  | 'Other';

export interface ITransaction extends Document {
  userId: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      default: 'Other',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
