import express from "express";
import { signout, test } from "../controller/user.controller.js";
import { makeReservation } from "../controller/user.controller.js";

const router = express.Router();

router.get("/", test);
router.post("/signout", signout);

router.post("/reservation", makeReservation);

export default router;
