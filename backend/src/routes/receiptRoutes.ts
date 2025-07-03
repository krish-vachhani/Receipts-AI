import express from "express";
import multer from "multer";
import { extractReceipt, getUserReceipts, getReceiptById, deleteReceipt } from "../controllers/receiptController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (!/\.(jpe?g|png)$/i.test(file.originalname)) {
      return cb(new Error("We only accept .jpg, .jpeg and .png formats!"));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// All receipt routes require authentication
router.use(authenticateToken);

// Receipt endpoints
router.post("/extract-receipt-details", upload.single("receipt"), extractReceipt);
router.get("/receipts", getUserReceipts);
router.get("/receipts/:id", getReceiptById);
router.delete("/receipts/:id", deleteReceipt);

export default router;
