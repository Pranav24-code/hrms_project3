import express from "express";
import {
  applyLeave,
  getAllLeaves,
  getMyLeaves,
  updateLeaveStatus,
   getLatestPendingLeaves
} from "../controllers/leave.controller.js";

const router = express.Router();

router.post("/apply", applyLeave);

router.get("/all", getAllLeaves);

router.get("/my/:id", getMyLeaves);

router.put("/status/:id", updateLeaveStatus);

router.get("/latest-pending", getLatestPendingLeaves);

export default router;