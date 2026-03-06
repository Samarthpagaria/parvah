const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controllers');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

// All AI routes require admin authentication
router.post('/chat', auth, requireAdmin, aiController.chatWithContext);

module.exports = router;
