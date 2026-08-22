import mongoose, { Document, Schema } from 'mongoose';

export interface IActionPlanItem extends Document {
  userId: string;
  title: string;
  description: string;
  category: 'Spending' | 'Savings' | 'Investment' | 'Debt' | 'Goal';
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  impact: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActionPlanItemSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Spending', 'Savings', 'Investment', 'Debt', 'Goal'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'Medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    impact: {
      type: String,
      required: true,
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

export const ActionPlanItem = mongoose.model<IActionPlanItem>('ActionPlanItem', ActionPlanItemSchema);
