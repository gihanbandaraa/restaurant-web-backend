import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Import routes
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err);
  });

// Create express app
const app = express();
app.use(express.json());

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
