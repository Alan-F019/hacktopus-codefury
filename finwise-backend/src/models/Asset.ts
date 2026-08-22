import mongoose, { Document, Schema } from 'mongoose';

export type AssetType = 'Stock' | 'ETF' | 'Mutual Fund' | 'Gold' | 'Cash' | 'Crypto' | 'Real Estate';

export interface IAsset extends Document {
  userId: string;
  name: string;
  type: AssetType;
  amount: number;
  ticker?: string;
  returnsYTD: number;
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema: Schema = new Schema(
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
    type: {
      type: String,
      enum: ['Stock', 'ETF', 'Mutual Fund', 'Gold', 'Cash', 'Crypto', 'Real Estate'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    ticker: {
      type: String,
      default: null,
    },
    returnsYTD: {
      type: Number,
      default: 8.5,
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

export const Asset = mongoose.model<IAsset>('Asset', AssetSchema);
