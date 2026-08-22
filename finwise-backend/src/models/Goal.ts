import mongoose, { Document, Schema } from 'mongoose';

export type GoalCategory =
  | 'Emergency'
  | 'Retirement'
  | 'House'
  | 'Vehicle'
  | 'Travel'
  | 'Education'
  | 'Other';

export interface IGoal extends Document {
  userId: string;
  name: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  timeHorizonYears: number;
  targetDate: string;
  expectedAnnualReturn: number;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Emergency', 'Retirement', 'House', 'Vehicle', 'Travel', 'Education', 'Other'],
      required: true,
      default: 'Other',
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    currentAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    timeHorizonYears: {
      type: Number,
      required: true,
      min: 0.1,
    },
    targetDate: {
      type: String,
    },
    expectedAnnualReturn: {
      type: Number,
      default: 8.0,
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

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
