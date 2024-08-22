import express from "express";
import {
  signin,
  signup,
  google,
  createStaffAccount,
} from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.post("/create-staff-account", createStaffAccount);

export default router;
