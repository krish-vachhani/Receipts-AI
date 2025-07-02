import { Request, Response, NextFunction } from "express";
import { handleUpload } from "../utils/storage";

export async function extractReceipt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const file = req.file as Express.Multer.File | undefined;

  if (!file) {
    res.status(400).send("No file uploaded");
    return;
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;

  try {
    const uploadResult = await handleUpload(dataUri);
    const imageUrl = uploadResult.secure_url;

    res.status(200).json({ imageUrl });
  } catch (error) {
    next(error);
  }
}
