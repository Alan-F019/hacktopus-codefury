import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email: string;
  age?: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingSavings: number;
  investmentAmount: number;
  financialGoal: string;
  riskScore: number;
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive' | 'Very Aggressive';
  recommendedAllocation: {
    Stock: number;
    ETF: number;
    'Mutual Fund': number;
    Gold: number;
    Cash: number;
  };
  isOnboarded: boolean;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      default: 'Alex Morgan',
    },
    email: {
      type: String,
      required: true,
      default: 'demo@finwise.app',
    },
    age: {
      type: Number,
      default: 28,
    },
    monthlyIncome: {
      type: Number,
      required: true,
      default: 7500,
    },
    monthlyExpenses: {
      type: Number,
      required: true,
      default: 4100,
    },
    existingSavings: {
      type: Number,
      required: true,
      default: 24000,
    },
    investmentAmount: {
      type: Number,
      required: true,
      default: 58000,
    },
    financialGoal: {
      type: String,
      default: 'Buy a Home & Retire Early at 55',
    },
    riskScore: {
      type: Number,
      default: 72,
    },
    riskLevel: {
      type: String,
      enum: ['Conservative', 'Moderate', 'Aggressive', 'Very Aggressive'],
      default: 'Aggressive',
    },
    recommendedAllocation: {
      type: Object,
      default: {
        Stock: 40,
        ETF: 30,
        'Mutual Fund': 15,
        Gold: 5,
        Cash: 10,
      },
    },
    isOnboarded: {
      type: Boolean,
      default: true,
    },
    photoURL: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        ret.uid = ret.firebaseUid;
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
