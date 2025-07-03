import { Request, Response, NextFunction } from "express";
import { handleUpload } from "../utils/storage";
import { extractReceiptData } from "../utils/aiClient";
import { Receipt } from "../models/Receipt";

export async function extractReceipt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const file = req.file as Express.Multer.File | undefined;
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;

  try {
    // Upload to Cloudinary with user-specific folder
    const uploadResult = await handleUpload(dataUri, user.id);
    const imageUrl = uploadResult.secure_url;
    
    // Extract receipt data using AI
    const receiptData = await extractReceiptData(imageUrl);
    
    // Save receipt to database
    const receipt = new Receipt({
      userId: user.id,
      date: receiptData.date,
      currency: receiptData.currency,
      vendor_name: receiptData.vendor_name,
      receipt_items: receiptData.receipt_items,
      tax: receiptData.tax,
      total: receiptData.total,
      image_url: imageUrl,
      cloudinary_public_id: uploadResult.public_id,
    });

    await receipt.save();

    res.json({
      id: receipt.id,
      userId: receipt.userId,
      image_url: imageUrl,
      ...receiptData,
      createdAt: receipt.createdAt,
    });
  } catch (error) {
    console.error("Receipt processing error:", error);
    next(error);
  }
}

// Get all receipts for the authenticated user
export async function getUserReceipts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const receipts = await Receipt.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json({
      receipts,
      total: receipts.length,
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    next(error);
  }
}

// Get a specific receipt by ID
export async function getReceiptById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const { id } = req.params;

  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const receipt = await Receipt.findOne({ _id: id, userId: user.id })
      .populate('userId', 'name email');

    if (!receipt) {
      res.status(404).json({ error: "Receipt not found or access denied" });
      return;
    }

    res.json(receipt);
  } catch (error) {
    console.error("Error fetching receipt:", error);
    next(error);
  }
}

// Delete a receipt
export async function deleteReceipt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const { id } = req.params;

  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const receipt = await Receipt.findOne({ _id: id, userId: user.id });

    if (!receipt) {
      res.status(404).json({ error: "Receipt not found or access denied" });
      return;
    }

    await Receipt.findByIdAndDelete(id);
    
    res.json({ message: "Receipt deleted successfully" });
  } catch (error) {
    console.error("Error deleting receipt:", error);
    next(error);
  }
}
