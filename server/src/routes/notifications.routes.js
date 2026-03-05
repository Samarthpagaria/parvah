const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notifications.controller");

// All notification routes require a valid JWT (works for both public_user and admin_user)
router.use(auth);

// GET    /api/notifications              — list all (supports ?unread_only=true&page=1&limit=20)
// DELETE /api/notifications              — clear all
router.route("/").get(getNotifications).delete(clearAllNotifications);

// GET /api/notifications/unread-count   — bell icon badge count
router.get("/unread-count", getUnreadCount);

// PUT    /api/notifications/read-all    — mark all as read
router.put("/read-all", markAllAsRead);

// PUT    /api/notifications/:id/read    — mark one as read
// DELETE /api/notifications/:id         — delete one
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
