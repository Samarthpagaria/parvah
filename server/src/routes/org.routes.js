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
  updateMember,
  listOrgCategories,
  createOrgCategory,
  updateOrgCategory,
  deleteOrgCategory,
  listMyCategories,
  listActiveOrganizations,
  listCategoriesByOrg,
} = require("../controllers/org.controller");

// ── Public-facing routes for the issue form (any authenticated user) ────────
// GET /api/organizations/public/list — all active orgs (org dropdown in new-issue form)
router.get("/public/list", auth, listActiveOrganizations);
// GET /api/organizations/public/:orgId/categories — org-specific categories
router.get("/public/:orgId/categories", auth, listCategoriesByOrg);

// ── Public/User routes ──────────────────────────────────────────────────────
// GET /api/organizations/categories/mine — for logged-in public users (legacy, uses user's org_id)
router.get("/categories/mine", auth, listMyCategories);

// ── Super Admin only ────────────────────────────────────────────────────────
router.get("/", auth, listOrganizations);         // list all orgs
router.post("/", auth, createOrganization);        // create new org
router.delete("/:orgId", auth, deleteOrganization); // deactivate org

// ── Any admin role ──────────────────────────────────────────────────────────
router.get("/:orgId", auth, getOrganization);      // get org details

// ── Org Admin only ──────────────────────────────────────────────────────────
router.put("/:orgId", auth, updateOrganization);   // update org settings

// ── read | edit roles ───────────────────────────────────────────────────────
router.get("/:orgId/members", auth, listOrgMembers);     // list members
router.get("/:orgId/categories", auth, listOrgCategories); // list categories

// ── Org Editor+ only ────────────────────────────────────────────────────────
router.post("/:orgId/categories", auth, createOrgCategory); // create category
router.put("/:orgId/categories/:catId", auth, updateOrgCategory); // update category

// ── Org Admin only ──────────────────────────────────────────────────────────
router.put("/:orgId/members/:memberId", auth, updateMember);      // update member role
router.delete("/:orgId/members/:memberId", auth, removeMember);     // remove member
router.delete("/:orgId/categories/:catId", auth, deleteOrgCategory); // delete category

module.exports = router;
