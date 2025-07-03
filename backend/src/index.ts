import dotenv from "dotenv";
dotenv.config();
import express from "express";
import receiptRouter from "./routes/receiptRoutes";
import authRouter from "./routes/authRoutes";
import cors from "cors";
import connectDB from "./config/database";

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use("/api/auth", authRouter);
app.use("/api", receiptRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Receipt App API is running",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ 
    error: "Internal server error", 
    message: error.message 
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
});
