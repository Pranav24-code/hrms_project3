import express from "express";
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getEmployeeAttendance,
  getAttendanceStats,
  getAttendanceHistory,
  getTodayEmployeeAttendance
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.post("/checkin", checkIn);
router.post("/checkout", checkOut);

router.get("/today", getTodayAttendance);
router.get("/history", getAttendanceHistory);
router.get("/employee/:id", getEmployeeAttendance);
router.get("/stats", getAttendanceStats);

router.get(
  "/today/:employeeId",
  getTodayEmployeeAttendance
);

export default router;