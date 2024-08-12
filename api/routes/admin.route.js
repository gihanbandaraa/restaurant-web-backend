import express from "express";
import {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controller/admin.controller.js";
import {
  addMenu,
  getMenuByCategory,
  getMenu,
  deleteMenu,
  updateMenu,
  getCategoryCounts,
} from "../controller/admin.controller.js";

import { addImage,getImages,deleteImage } from "../controller/admin.controller.js";

const router = express.Router();

router.post("/add-category", addCategory);
router.get("/get-categories", getCategories);
router.put("/update-category/:id", updateCategory);
router.delete("/delete-category/:id", deleteCategory);

router.post("/add-menu", addMenu);
router.get("/get-menu", getMenu);
router.get("/get-menu-category/:categoryId", getMenuByCategory);
router.put("/update-menu/:id", updateMenu);
router.delete("/delete-menu/:id", deleteMenu);

router.get("/get-category-counts", getCategoryCounts);

router.post("/add-image", addImage);
router.get("/get-images", getImages);
router.delete("/delete-image/:id", deleteImage);


export default router;
