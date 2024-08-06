import express from "express";
import { addCategory, getCategories,updateCategory,deleteCategory } from "../controller/admin.controller.js";

const router = express.Router();

router.post("/add-category", addCategory);
router.get("/get-categories", getCategories);
router.put("/update-category/:id", updateCategory);
router.delete("/delete-category/:id", deleteCategory);

export default router;
