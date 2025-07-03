import mongoose, { Document, Schema } from 'mongoose';

export interface IReceiptItem {
  item_name: string;
  item_cost: number;
}

export interface IReceipt extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  currency: string;
  vendor_name: string;
  receipt_items: IReceiptItem[];
  tax: number;
  total: number;
  image_url: string;
  cloudinary_public_id: string;
  createdAt: Date;
  updatedAt: Date;
}

const receiptItemSchema = new Schema<IReceiptItem>({
  item_name: {
    type: String,
    required: true,
  },
  item_cost: {
    type: Number,
    required: true,
  },
}, { _id: false });

const receiptSchema = new Schema<IReceipt>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  vendor_name: {
    type: String,
    required: true,
  },
  receipt_items: [receiptItemSchema],
  tax: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  image_url: {
    type: String,
    required: true,
  },
  cloudinary_public_id: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const Receipt = mongoose.model<IReceipt>('Receipt', receiptSchema);