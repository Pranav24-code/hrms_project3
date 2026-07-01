import express from "express";
import {
  createManualNotification,
  deleteNotification,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  sendPayrollPaidNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/user/:userId", getUserNotifications);
router.patch("/:id/read", markNotificationAsRead);
router.patch("/user/:userId/read-all", markAllNotificationsAsRead);
router.delete("/:id", deleteNotification);
router.post("/create", createManualNotification);
router.post("/payroll-paid", sendPayrollPaidNotifications);

export default router;
