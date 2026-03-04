// 🔐 Authentication (/api/auth)
// POST /api/auth/admin/login — Admin login
// POST /api/auth/public/login — Public user login
// POST /api/auth/public/register — Public user registration
// GET /api/auth/me — Get current user profile (requires JWT)
// PUT /api/auth/profile — Update profile info (requires JWT)
// POST /api/auth/logout — Logout and clear session (requires JWT)
// 🏢 Organizations (/api/organizations)
// GET /api/organizations — List all organizations (Super Admin only)
// POST /api/organizations — Create new organization (Super Admin only)
// DELETE /api/organizations/:orgId — Deactivate an organization (Super Admin only)
// GET /api/organizations/:orgId — Get organization details (Admin/Staff)
// PUT /api/organizations/:orgId — Update organization settings (Org Owner only)
// GET /api/organizations/:orgId/members — List organization staff (Edit role+)
// DELETE /api/organizations/:orgId/members/:memberId — Remove staff member (Org Owner only)
// ✉️ Invitations (/api/invitations)
// POST /api/invitations — Send invite link to email (Edit role+)
// GET /api/invitations/:orgId — List all invites for an organization (Edit role+)
// DELETE /api/invitations/:inviteId — Revoke a pending invite (Edit role+)
// GET /api/invitations/verify/:token — Public: Verify invite link validity
// POST /api/invitations/accept — Public: Accept invite and create account
// 🎫 Issues & Reporting (/api/issues)
// GET /api/issues — List issues (Public User: own | Admin: org-wide)
// POST /api/issues — Submit a new issue report (Public User)
// GET /api/issues/:issueId — Get specific issue details
// POST /api/issues/:issueId/upvote — Upvote an issue (Public User)
// GET /api/issues/:issueId/activity — View audit trail/activity log for an issue
// GET /api/issues/:issueId/attachments — Get file attachments for an issue
// POST /api/issues/:issueId/attachments — Upload new attachment (Reporter/Admin)
// PUT /api/issues/:issueId — Update issue description/title (Admin)
// PUT /api/issues/:issueId/status — Update resolution status (Staff/Admin)
// PUT /api/issues/:issueId/assign — Assign issue to staff member (Edit role+)
// PUT /api/issues/:issueId/priority — Update issue priority (Edit role+)
// DELETE /api/issues/:issueId — Deactivate an issue report (Org Owner only)
// 📊 Analytics (/api/analytics)
// GET /api/analytics/overview/:orgId — Summary of counts (Total, Resolved, etc)
// GET /api/analytics/trends/:orgId — Daily/Weekly issue count trends
// GET /api/analytics/by-category/:orgId — Breakdown by category (Traffic, Fire, etc)
// GET /api/analytics/by-status/:orgId — Breakdown by current status
// GET /api/analytics/staff-performance/:orgId — Analysis of staff resolution rates
// GET /api/analytics/resolution-time/:orgId — Average time to resolve issues