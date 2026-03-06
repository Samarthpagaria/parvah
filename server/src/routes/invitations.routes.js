const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  sendInvite,
  listInvites,
  revokeInvite,
  verifyToken,
  acceptInvite,
  getMyInvites,
  acceptInviteForMember,
} = require("../controllers/invitations.controller");

// ── Protected (auth needed) ───────────────────────────────
router.post("/", auth, requireAdmin, sendInvite); // Send invite
router.get("/my-invites", auth, getMyInvites); // Get my invites
router.get("/:orgId", auth, requireAdmin, listInvites); // List invites for org
router.post("/accept-member/:inviteId", auth, acceptInviteForMember); // Accept invite for logged in member
router.delete("/:inviteId", auth, requireAdmin, revokeInvite); // Revoke invite

// ── Public (no auth) ──────────────────────────────────────
router.get("/verify/:token", verifyToken); // Verify token validity
router.post("/accept", acceptInvite); // Accept invite and create account

module.exports = router;
