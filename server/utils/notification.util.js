import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { io, userSocketMap } from "../index.js";

export const emitNotification = (recipientId, payload) => {
  const socketId = userSocketMap[recipientId.toString()];
  if (socketId) {
    io.to(socketId).emit("notification_created", payload);
  }
};

export const emitUnreadCount = async (recipientId) => {
  const unreadCount = await Notification.countDocuments({
    recipient: recipientId,
    read: false,
  });

  const socketId = userSocketMap[recipientId.toString()];
  if (socketId) {
    io.to(socketId).emit("notification_state_changed", { unreadCount });
  }

  return unreadCount;
};

export const createNotification = async ({ recipient, type = "system", title, message, data = {} }) => {
  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    data,
  });

  emitNotification(recipient, notification);
  await emitUnreadCount(recipient);

  return notification;
};

export const notifyRoleUsers = async ({ role, type = "system", title, message, data = {} }) => {
  const users = await User.find({ role, isActive: true }).select("_id");
  const notifications = [];

  for (const user of users) {
    const notification = await createNotification({
      recipient: user._id,
      type,
      title,
      message,
      data,
    });
    notifications.push(notification);
  }

  return notifications;
};
