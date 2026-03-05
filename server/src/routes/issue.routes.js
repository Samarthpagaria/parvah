// routes/issues.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireAdmin');
const { requireRole } = require('../middleware/requireRole');
const issuesController = require('../controllers/issue.controllers');

// ─── Public User Routes ───────────────────────────────────────────────────────

// GET /api/issues — Admin: all org issues | Public User: own issues
router.get('/', authenticate, issuesController.getIssues);

// POST /api/issues — Public User submits a new issue
router.post('/', authenticate, issuesController.createIssue);

// GET /api/issues/:issueId — Reporter or Admin
router.get('/:issueId', authenticate, issuesController.getIssueById);

// POST /api/issues/:issueId/upvote — Public User
router.post('/:issueId/upvote', authenticate, issuesController.upvoteIssue);

// ─── Admin + Reporter Shared Routes ──────────────────────────────────────────

// GET /api/issues/:issueId/activity — Admin or Reporter
router.get('/:issueId/activity', authenticate, issuesController.getIssueActivity);

// GET /api/issues/:issueId/attachments — Admin or Reporter
router.get('/:issueId/attachments', authenticate, issuesController.getAttachments);

// POST /api/issues/:issueId/attachments — Admin or Reporter
router.post('/:issueId/attachments', authenticate, issuesController.uploadAttachment);

// ─── Admin-Only Routes ────────────────────────────────────────────────────────

// PUT /api/issues/:issueId — edit role+ or assigned staff
router.put('/:issueId', authenticate, requireAdmin, issuesController.updateIssue);

// PUT /api/issues/:issueId/status — edit role+ or assigned staff
router.put('/:issueId/status', authenticate, requireAdmin, issuesController.updateIssueStatus);

// PUT /api/issues/:issueId/assign — edit role+
router.put('/:issueId/assign', authenticate, requireAdmin, requireRole(['owner', 'edit']), issuesController.assignIssue);

// PUT /api/issues/:issueId/priority — edit role+
router.put('/:issueId/priority', authenticate, requireAdmin, requireRole(['owner', 'edit']), issuesController.updateIssuePriority);

// DELETE /api/issues/:issueId — Org Admin / Super Admin only
router.delete('/:issueId', authenticate, requireAdmin, requireRole(['owner']), issuesController.deleteIssue);

module.exports = router;