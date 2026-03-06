const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controllers");
const auth = require("../middleware/auth");

// All AI routes require authentication (citizen or admin)
router.post("/chat", auth, aiController.chatResponse);

module.exports = router;
