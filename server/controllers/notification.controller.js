import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import {
  createNotification,
  emitUnreadCount,
  notifyRoleUsers,
} from "../utils/notification.util.js";

export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { filter = "all" } = req.query;

    const query = { recipient: userId };
    if (filter === "unread") query.read = false;
    if (filter === "read") query.read = true;

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    const unreadCount = await emitUnreadCount(notification.recipient);

    res.status(200).json({
      success: true,
      notification,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true },
    );

    const unreadCount = await emitUnreadCount(userId);

    res.status(200).json({ success: true, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    const unreadCount = await emitUnreadCount(notification.recipient);

    res.status(200).json({ success: true, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createManualNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type = "system",
      recipientId,
      recipientIds = [],
      targetRole,
      data = {},
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required" });
    }

    let recipients = [];

    if (recipientId) {
      recipients = [recipientId];
    } else if (Array.isArray(recipientIds) && recipientIds.length > 0) {
      recipients = recipientIds;
    } else if (targetRole) {
      const users = await User.find({ role: targetRole, isActive: true }).select("_id");
      recipients = users.map((u) => u._id.toString());
    }

    if (recipients.length === 0) {
      return res.status(400).json({ success: false, message: "No recipients found" });
    }

    const notifications = [];
    for (const recipient of recipients) {
      const notification = await createNotification({
        recipient,
        type,
        title,
        message,
        data,
      });
      notifications.push(notification);
    }

    res.status(201).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendPayrollPaidNotifications = async (req, res) => {
  try {
    const { month, year } = req.body;

    const label = month && year ? `${month} ${year}` : "this cycle";
    const notifications = await notifyRoleUsers({
      role: "Employee",
      type: "payroll",
      title: "Salary Paid",
      message: `Your payroll for ${label} has been processed by manager.`,
      data: { month, year },
    });

    res.status(201).json({
      success: true,
      count: notifications.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
