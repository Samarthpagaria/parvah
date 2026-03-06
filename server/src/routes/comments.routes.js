const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const commentsController = require("../controllers/comments.controller");

// All comment routes require authentication
router.use(authenticate);

// GET /api/issues/:issueId/comments
router.get("/:issueId/comments", commentsController.getComments);

// POST /api/issues/:issueId/comments
router.post("/:issueId/comments", commentsController.addComment);

// PUT /api/issues/:issueId/comments/:commentId
router.put("/:issueId/comments/:commentId", commentsController.updateComment);

// DELETE /api/issues/:issueId/comments/:commentId
router.delete(
  "/:issueId/comments/:commentId",
  commentsController.deleteComment,
);

module.exports = router;
