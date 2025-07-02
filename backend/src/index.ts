import dotenv from "dotenv";
dotenv.config();
import express from "express";
import receiptRouter from "./routes/receiptRoutes";
import cors from "cors";
const app = express();

app.use(cors());

app.use("/api/receipts", receiptRouter);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
