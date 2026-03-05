// services/notification.service.js
// Handles BOTH in-app notifications (Supabase) AND email notifications (Resend).
// Called from issues.service, comments.service — never from routes directly.

const { supabaseAdmin } = require("../config/db");
const {
  sendStatusChangedEmail,
  sendIssueAssignedEmail,
  sendNewIssueEmail,
  sendCommentAddedEmail,
  sendIssueResolvedEmail,
} = require("./email.service");

// ─────────────────────────────────────────────────────────────────────────────
// CORE: Insert a single notification row into DB
// ─────────────────────────────────────────────────────────────────────────────
const createNotification = async ({
  recipient_id,
  recipient_type,
  issue_id = null,
  type,
  title,
  message,
}) => {
  const { data, error } = await supabaseAdmin
    .from("notifications")
    .insert({
      recipient_id,
      recipient_type,
      issue_id,
      type,
      title,
      message,
      is_read: false,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "[NotificationService] Failed to create notification:",
      error.message,
    );
    return null;
  }

  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE: Bulk insert notifications into DB
// ─────────────────────────────────────────────────────────────────────────────
const createBulkNotifications = async (notifications) => {
  if (!notifications || notifications.length === 0) return;

  const rows = notifications.map((n) => ({
    recipient_id: n.recipient_id,
    recipient_type: n.recipient_type,
    issue_id: n.issue_id || null,
    type: n.type,
    title: n.title,
    message: n.message,
    is_read: false,
  }));

  const { error } = await supabaseAdmin.from("notifications").insert(rows);

  if (error) {
    console.error(
      "[NotificationService] Bulk notification failed:",
      error.message,
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Fetch a user's email + name from the correct table
// ─────────────────────────────────────────────────────────────────────────────
const getUserEmail = async (userId, userType) => {
  const table = userType === "admin_user" ? "admin_users" : "public_users";

  const { data, error } = await supabaseAdmin
    .from(table)
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data; // { email, full_name }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. STATUS CHANGED
// In-app → reporter | Email → reporter
// ─────────────────────────────────────────────────────────────────────────────
const notifyStatusChange = async ({
  recipient_id,
  issue_id,
  issueTitle,
  newStatus,
}) => {
  // In-app
  await createNotification({
    recipient_id,
    recipient_type: "public_user",
    issue_id,
    type: "STATUS_UPDATE",
    title: "Your issue status has been updated",
    message: `"${issueTitle}" is now marked as ${newStatus ? newStatus.replace(/_/g, " ") : "updated"}.`,
  });

  // Email
  const user = await getUserEmail(recipient_id, "public_user");
  if (user) {
    await sendStatusChangedEmail({
      to: user.email,
      reporterName: user.full_name,
      issueTitle,
      issueId: issue_id,
      newStatus,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ISSUE ASSIGNED TO STAFF
// In-app → staff | Email → staff
// ─────────────────────────────────────────────────────────────────────────────
const notifyIssueAssigned = async ({
  recipient_id,
  issue_id,
  issueTitle,
  orgName,
  priority,
}) => {
  // In-app
  await createNotification({
    recipient_id,
    recipient_type: "admin_user",
    issue_id,
    type: "NEW_ASSIGNMENT",
    title: "You have been assigned a new issue",
    message: `You have been assigned "${issueTitle}" in ${orgName}. Please review and take action.`,
  });

  // Email
  const staff = await getUserEmail(recipient_id, "admin_user");
  if (staff) {
    await sendIssueAssignedEmail({
      to: staff.email,
      staffName: staff.full_name,
      issueTitle,
      issueId: issue_id,
      orgName,
      priority: priority || "medium",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. NEW ISSUE SUBMITTED
// In-app → all org admins | Email → all org admins
// adminList: [{ id, email, full_name }]
// ─────────────────────────────────────────────────────────────────────────────
const notifyNewIssueToAdmins = async ({
  adminList,
  issue_id,
  issueTitle,
  reporterName,
  category,
  priority,
}) => {
  // In-app bulk
  const inAppNotifications = adminList.map((admin) => ({
    recipient_id: admin.id,
    recipient_type: "admin_user",
    issue_id,
    type: "NEW_ISSUE",
    title: "A new issue has been submitted",
    message: `${reporterName} submitted a new issue: "${issueTitle}".`,
  }));
  await createBulkNotifications(inAppNotifications);

  // Email each admin individually (personalized greeting)
  const emailPromises = adminList.map((admin) =>
    sendNewIssueEmail({
      to: admin.email,
      adminName: admin.full_name,
      issueTitle,
      issueId: issue_id,
      reporterName,
      category,
      priority,
    }),
  );
  await Promise.allSettled(emailPromises);
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. COMMENT ADDED
// In-app → all participants | Email → all participants
// recipients: [{ id, type, email, full_name }]
// ─────────────────────────────────────────────────────────────────────────────
const notifyCommentAdded = async ({
  recipients,
  issue_id,
  issueTitle,
  commenterName,
  commentPreview,
}) => {
  // In-app bulk
  const inAppNotifications = recipients.map((r) => ({
    recipient_id: r.id,
    recipient_type: r.type,
    issue_id,
    type: "COMMENT_ADDED",
    title: "New comment on your issue",
    message: `${commenterName} commented on "${issueTitle}".`,
  }));
  await createBulkNotifications(inAppNotifications);

  // Email each recipient
  const emailPromises = recipients.map((r) =>
    sendCommentAddedEmail({
      to: r.email,
      recipientName: r.full_name,
      issueTitle,
      issueId: issue_id,
      commenterName,
      commentPreview: commentPreview?.substring(0, 150),
    }),
  );
  await Promise.allSettled(emailPromises);
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. ISSUE RESOLVED
// In-app → reporter | Email → reporter
// ─────────────────────────────────────────────────────────────────────────────
const notifyIssueResolved = async ({
  recipient_id,
  issue_id,
  issueTitle,
  resolutionNote,
}) => {
  // In-app
  await createNotification({
    recipient_id,
    recipient_type: "public_user",
    issue_id,
    type: "ISSUE_RESOLVED",
    title: "Your issue has been resolved",
    message: resolutionNote
      ? `"${issueTitle}" has been resolved. Note: ${resolutionNote}`
      : `"${issueTitle}" has been marked as resolved.`,
  });

  // Email
  const user = await getUserEmail(recipient_id, "public_user");
  if (user) {
    await sendIssueResolvedEmail({
      to: user.email,
      reporterName: user.full_name,
      issueTitle,
      issueId: issue_id,
      resolutionNote,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. CRITICAL ISSUE — in-app only for all edit+ admins
// ─────────────────────────────────────────────────────────────────────────────
const notifyCriticalIssue = async ({ adminIds, issue_id, issueTitle }) => {
  const notifications = adminIds.map((adminId) => ({
    recipient_id: adminId,
    recipient_type: "admin_user",
    issue_id,
    type: "CRITICAL_ISSUE",
    title: "🚨 Critical priority issue submitted",
    message: `A critical issue requires immediate attention: "${issueTitle}".`,
  }));

  await createBulkNotifications(notifications);
};

module.exports = {
  createNotification,
  createBulkNotifications,
  notifyStatusChange,
  notifyIssueAssigned,
  notifyNewIssueToAdmins,
  notifyCommentAdded,
  notifyIssueResolved,
  notifyCriticalIssue,
};
