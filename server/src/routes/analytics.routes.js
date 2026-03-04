// routes/analytics.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireAdmin');
const analyticsController = require('../controllers/analytics.controller');

// All analytics routes require authentication + admin role
router.use(authenticate);
router.use(requireAdmin);

// GET /api/analytics/overview/:orgId
// Summary stats: total, open, resolved, avg resolution time
router.get('/overview/:orgId', analyticsController.getOverview);

// GET /api/analytics/trends/:orgId
// Issue count over time (daily/weekly/monthly)
router.get('/trends/:orgId', analyticsController.getTrends);

// GET /api/analytics/by-category/:orgId
// Issue breakdown by category
router.get('/by-category/:orgId', analyticsController.getByCategory);

// GET /api/analytics/by-status/:orgId
// Status distribution
router.get('/by-status/:orgId', analyticsController.getByStatus);

// GET /api/analytics/staff-performance/:orgId
// Resolution stats per staff member
router.get('/staff-performance/:orgId', analyticsController.getStaffPerformance);

// GET /api/analytics/resolution-time/:orgId
// Average resolution time by category
router.get('/resolution-time/:orgId', analyticsController.getResolutionTime);

module.exports = router;