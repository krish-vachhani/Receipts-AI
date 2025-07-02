import express from "express";
import multer from "multer";
import { extractReceipt } from "../controllers/receiptController";

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

router.post("/extract", upload.single("receipt"), extractReceipt);

export default router;
