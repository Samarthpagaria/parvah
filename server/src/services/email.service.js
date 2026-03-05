// services/email.service.js
// Handles all outgoing emails via Resend.
// Each function builds an HTML template and sends it.
// Called from notification.service.js — never from routes directly.

const { resend, FROM_EMAIL } = require("../config/mailer");

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HTML WRAPPER
// Wraps all email content in a consistent branded layout
// ─────────────────────────────────────────────────────────────────────────────
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CivicTrack Notification</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#2563eb;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                🏛️ CivicTrack
              </h1>
              <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px;">Smart Issue Reporting & Resolution</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
                You're receiving this email because you're registered on CivicTrack.<br/>
                © ${new Date().getFullYear()} CivicTrack. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE HELPER
// Returns a colored inline badge based on issue status
// ─────────────────────────────────────────────────────────────────────────────
const statusBadge = (status) => {
  const colors = {
    open: { bg: "#dbeafe", text: "#1d4ed8" },
    in_progress: { bg: "#fef9c3", text: "#854d0e" },
    on_hold: { bg: "#f3e8ff", text: "#7e22ce" },
    resolved: { bg: "#dcfce7", text: "#15803d" },
    closed: { bg: "#f1f5f9", text: "#475569" },
    rejected: { bg: "#fee2e2", text: "#dc2626" },
  };
  const color = colors[status] || { bg: "#f1f5f9", text: "#475569" };
  const label = status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Unknown";
  return `<span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${color.bg};color:${color.text};font-size:13px;font-weight:600;">${label}</span>`;
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE SEND HELPER
// ─────────────────────────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[EmailService] Resend error:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[EmailService] Unexpected error:", err.message);
    return null; // Non-fatal — don't crash the parent operation
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. STATUS CHANGED — sent to the public user (reporter)
// ─────────────────────────────────────────────────────────────────────────────
const sendStatusChangedEmail = async ({
  to,
  reporterName,
  issueTitle,
  issueId,
  newStatus,
}) => {
  const issueUrl = `${process.env.FRONTEND_URL}/issues/${issueId}`;

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">Issue Status Updated</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hi ${reporterName}, here's an update on your reported issue.</p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Issue</p>
      <p style="margin:0 0 16px;color:#1e293b;font-size:16px;font-weight:600;">${issueTitle}</p>
      <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">New Status</p>
      ${statusBadge(newStatus)}
    </div>

    <a href="${issueUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
      View Issue →
    </a>
  `);

  return sendEmail({
    to,
    subject: `Issue Update: "${issueTitle}" is now ${newStatus ? newStatus.replace(/_/g, " ") : "updated"}`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ISSUE ASSIGNED — sent to the staff member
// ─────────────────────────────────────────────────────────────────────────────
const sendIssueAssignedEmail = async ({
  to,
  staffName,
  issueTitle,
  issueId,
  orgName,
  priority,
}) => {
  const issueUrl = `${process.env.FRONTEND_URL}/admin/issues/${issueId}`;

  const priorityColors = {
    low: "#22c55e",
    medium: "#f59e0b",
    high: "#ef4444",
    critical: "#7f1d1d",
  };
  const priorityColor = priorityColors[priority] || "#64748b";

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">You've Been Assigned an Issue</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hi ${staffName}, an issue has been assigned to you in <strong>${orgName}</strong>. Please review it and take action.</p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Issue Title</p>
      <p style="margin:0 0 16px;color:#1e293b;font-size:16px;font-weight:600;">${issueTitle}</p>
      <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Priority</p>
      <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${priorityColor};color:#ffffff;font-size:13px;font-weight:600;">
        ${priority ? priority.toUpperCase() : "MEDIUM"}
      </span>
    </div>

    <a href="${issueUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
      Open Issue →
    </a>
  `);

  return sendEmail({
    to,
    subject: `[CivicTrack] New Issue Assigned: "${issueTitle}"`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. NEW ISSUE SUBMITTED — sent to all org admins
// ─────────────────────────────────────────────────────────────────────────────
const sendNewIssueEmail = async ({
  to,
  adminName,
  issueTitle,
  issueId,
  reporterName,
  category,
  priority,
}) => {
  const issueUrl = `${process.env.FRONTEND_URL}/admin/issues/${issueId}`;

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">New Issue Submitted</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hi ${adminName}, a new issue has been submitted that requires your attention.</p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Issue Title</p>
      <p style="margin:0 0 16px;color:#1e293b;font-size:16px;font-weight:600;">${issueTitle}</p>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" style="padding-right:12px;">
            <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;text-transform:uppercase;">Reported By</p>
            <p style="margin:0;color:#1e293b;font-size:14px;">${reporterName}</p>
          </td>
          <td width="50%">
            <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;text-transform:uppercase;">Category</p>
            <p style="margin:0;color:#1e293b;font-size:14px;">${category || "Uncategorized"}</p>
          </td>
        </tr>
      </table>
    </div>

    <a href="${issueUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
      Review Issue →
    </a>
  `);

  return sendEmail({
    to,
    subject: `[CivicTrack] New Issue: "${issueTitle}" submitted by ${reporterName}`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. COMMENT ADDED — sent to all issue participants
// ─────────────────────────────────────────────────────────────────────────────
const sendCommentAddedEmail = async ({
  to,
  recipientName,
  issueTitle,
  issueId,
  commenterName,
  commentPreview,
}) => {
  const issueUrl = `${process.env.FRONTEND_URL}/issues/${issueId}`;

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">New Comment on Your Issue</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hi ${recipientName}, <strong>${commenterName}</strong> added a comment on <strong>"${issueTitle}"</strong>.</p>

    <div style="background:#f8fafc;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;color:#475569;font-size:14px;font-style:italic;">"${commentPreview}${commentPreview?.length >= 150 ? "..." : ""}"</p>
    </div>

    <a href="${issueUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
      View Comment →
    </a>
  `);

  return sendEmail({
    to,
    subject: `[CivicTrack] New comment on "${issueTitle}"`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. ISSUE RESOLVED — sent to the public user (reporter)
// ─────────────────────────────────────────────────────────────────────────────
const sendIssueResolvedEmail = async ({
  to,
  reporterName,
  issueTitle,
  issueId,
  resolutionNote,
}) => {
  const issueUrl = `${process.env.FRONTEND_URL}/issues/${issueId}`;

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">✅ Your Issue Has Been Resolved</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hi ${reporterName}, great news! Your issue has been resolved by our team.</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Issue</p>
      <p style="margin:0 0 16px;color:#1e293b;font-size:16px;font-weight:600;">${issueTitle}</p>

      ${
        resolutionNote
          ? `
        <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Resolution Note</p>
        <p style="margin:0;color:#475569;font-size:14px;">${resolutionNote}</p>
      `
          : ""
      }
    </div>

    <a href="${issueUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
      View Resolution →
    </a>
  `);

  return sendEmail({
    to,
    subject: `✅ Resolved: "${issueTitle}"`,
    html,
  });
};

module.exports = {
  sendStatusChangedEmail,
  sendIssueAssignedEmail,
  sendNewIssueEmail,
  sendCommentAddedEmail,
  sendIssueResolvedEmail,
};
