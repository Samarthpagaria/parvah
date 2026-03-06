const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  listOrganizations,
  createOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  listOrgMembers,
  removeMember,
  listOrgCategories,
  createOrgCategory,
  deleteOrgCategory,
  listMyCategories,
} = require("../controllers/org.controller");

// ── Public/User routes ─────────────────────────────────────
// GET /api/organizations/categories/mine — for logged-in public users
router.get("/categories/mine", auth, listMyCategories);

// ── Super Admin only ───────────────────────────────────────
router.get("/", auth, listOrganizations); // list all orgs
router.post("/", auth, createOrganization); // create new org
router.delete("/:orgId", auth, deleteOrganization); // deactivate org

// ── Any admin role ─────────────────────────────────────────
router.get("/:orgId", auth, getOrganization); // get org details

// ── Org Admin only ─────────────────────────────────────────
router.put("/:orgId", auth, updateOrganization); // update org settings

// ── read | edit roles ──────────────────────────────────────
router.get("/:orgId/members", auth, listOrgMembers); // list members
router.get("/:orgId/categories", auth, listOrgCategories); // list categories

// ── Org Editor+ only ───────────────────────────────────────
router.post("/:orgId/categories", auth, createOrgCategory); // create category

// ── Org Admin only ─────────────────────────────────────────
router.delete("/:orgId/members/:memberId", auth, removeMember); // remove member
router.delete("/:orgId/categories/:catId", auth, deleteOrgCategory); // delete category

module.exports = router;
