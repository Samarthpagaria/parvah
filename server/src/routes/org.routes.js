const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  listOrganizations,
  listMyOrganizations,
  createOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  listOrgMembers,
  removeMember,
} = require("../controllers/org.controller");

// ── Super Admin only ───────────────────────────────────────
router.get("/", auth, listOrganizations); // list all orgs (Super Admin)
router.get("/my", auth, listMyOrganizations); // list user's orgs
router.post("/", auth, createOrganization); // create new org
router.delete("/:orgId", auth, deleteOrganization); // deactivate org

// ── Any admin role ─────────────────────────────────────────
router.get("/:orgId", auth, getOrganization); // get org details

// ── Org Admin only ─────────────────────────────────────────
router.put("/:orgId", auth, updateOrganization); // update org settings

// ── read | edit roles ──────────────────────────────────────
router.get("/:orgId/members", auth, listOrgMembers); // list members

// ── Org Admin only ─────────────────────────────────────────
router.delete("/:orgId/members/:memberId", auth, removeMember); // remove member

module.exports = router;
