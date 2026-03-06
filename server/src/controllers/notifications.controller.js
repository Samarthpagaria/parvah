const { supabaseAdmin } = require("../config/db");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notifications
// Fetch all notifications for the logged-in user (public or admin).
// Supports: ?unread_only=true, ?page=1&limit=20
// ─────────────────────────────────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  const { id: userId } = req.user;
  const { unread_only, page = 1, limit = 20 } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  let query = supabaseAdmin
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (unread_only === "true") {
    query = query.eq("is_read", false);
  }

  const { data, error, count } = await query;

  if (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications." });
  }

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total: count,
      page: pageNum,
      limit: limitNum,
      total_pages: Math.ceil(count / limitNum),
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notifications/unread-count
// Returns just the unread count — used by the bell icon badge.
// ─────────────────────────────────────────────────────────────────────────────
const getUnreadCount = async (req, res) => {
  const { id: userId } = req.user;

  const { count, error } = await supabaseAdmin
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .eq("is_read", false);

  if (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch unread count." });
  }

  return res.status(200).json({ success: true, unread_count: count });
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/notifications/:id/read
// Mark a single notification as read.
// ─────────────────────────────────────────────────────────────────────────────
const markAsRead = async (req, res) => {
  const { id: userId } = req.user;
  const { id } = req.params;

  // Verify ownership before updating
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("notifications")
    .select("id, recipient_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return res
      .status(404)
      .json({ success: false, message: "Notification not found." });
  }

  if (existing.recipient_id !== userId) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  const { data, error } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to mark notification as read.",
      });
  }

  return res.status(200).json({ success: true, data });
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/notifications/read-all
// Mark ALL unread notifications as read for the logged-in user.
// ─────────────────────────────────────────────────────────────────────────────
const markAllAsRead = async (req, res) => {
  const { id: userId } = req.user;

  const { error } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", userId)
    .eq("is_read", false);

  if (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to mark all as read." });
  }

  return res
    .status(200)
    .json({ success: true, message: "All notifications marked as read." });
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/notifications/:id
// Delete a single notification (only by its owner).
// ─────────────────────────────────────────────────────────────────────────────
const deleteNotification = async (req, res) => {
  const { id: userId } = req.user;
  const { id } = req.params;

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("notifications")
    .select("id, recipient_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return res
      .status(404)
      .json({ success: false, message: "Notification not found." });
  }

  if (existing.recipient_id !== userId) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  const { error } = await supabaseAdmin
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete notification." });
  }

  return res
    .status(200)
    .json({ success: true, message: "Notification deleted." });
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/notifications
// Clear ALL notifications for the logged-in user.
// ─────────────────────────────────────────────────────────────────────────────
const clearAllNotifications = async (req, res) => {
  const { id: userId } = req.user;

  const { error } = await supabaseAdmin
    .from("notifications")
    .delete()
    .eq("recipient_id", userId);

  if (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to clear notifications." });
  }

  return res
    .status(200)
    .json({ success: true, message: "All notifications cleared." });
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
