import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Connect to MongoDB

dotenv.config();
mongoose.connect(process.env.MONGODB_CONNECTION_STRING).then(() => {
  console.log("Connected to MongoDB");
});

const app = express();

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

