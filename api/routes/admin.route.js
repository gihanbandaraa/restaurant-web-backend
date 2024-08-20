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

import {
  addImage,
  getImages,
  deleteImage,
} from "../controller/admin.controller.js";

import {
  getReservations,
  confirmReservation,
  rejectReservation,
} from "../controller/admin.controller.js";

import {
  getQueries,
  deleteQuery,
  replyQuery,
} from "../controller/admin.controller.js";

import {
  addOrder,
  getOrders,
  markOrderAsReady,
  markOrderAsDelivered,
} from "../controller/admin.controller.js";

import {
  addOffer,
  getOffers,
  updateOffer,
  deleteOffer,
} from "../controller/admin.controller.js";

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

router.get("/get-reservations", getReservations);
router.put("/confirm-reservation/:id", confirmReservation);
router.put("/reject-reservation/:id", rejectReservation);

router.get("/get-queries", getQueries);
router.delete("/delete-query/:id", deleteQuery);
router.put("/reply-query/:id", replyQuery);

router.post("/add-order", addOrder);
router.get("/get-orders", getOrders);
router.put("/mark-order-as-ready/:id", markOrderAsReady);
router.put("/mark-order-as-delivered/:id", markOrderAsDelivered);

router.post("/add-offer", addOffer);
router.get("/get-offers", getOffers);
router.put("/update-offer/:id", updateOffer);
router.delete("/delete-offer/:id", deleteOffer);

export default router;
