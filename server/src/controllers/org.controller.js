const { supabaseAdmin } = require("../config/db");

// ── Helper: Check if user is Super Admin ───────────────────
const isSuperAdmin = async (userId) => {
  const { data } = await supabaseAdmin
    .from("admin_users")
    .select("is_super_admin")
    .eq("id", userId)
    .single();
  return data?.is_super_admin === true;
};

// ── Helper: Get user's role in an org ─────────────────────
const getOrgRole = async (userId, orgId) => {
  const { data } = await supabaseAdmin
    .from("org_admin_members")
    .select("role")
    .eq("admin_user_id", userId)
    .eq("org_id", orgId)
    .eq("is_active", true)
    .single();
  return data?.role || null;
};

// ── List All Organizations ─────────────────────────────────
// GET /api/organizations
// Access: Super Admin only
const listOrganizations = async (req, res) => {
  try {
    const superAdmin = await isSuperAdmin(req.user.id);
    if (!superAdmin) {
      return res
        .status(403)
        .json({ error: "Access denied. Super Admin only." });
    }

    const { data, error } = await supabaseAdmin
      .from("organizations")
      .select(
        `
        *,
        owner:admin_users(id, full_name, email)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ organizations: data });
  } catch (err) {
    console.error("listOrganizations error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Create Organization ────────────────────────────────────
// POST /api/organizations
// Access: Super Admin only
const createOrganization = async (req, res) => {
  try {
    const superAdmin = await isSuperAdmin(req.user.id);
    if (!superAdmin) {
      return res
        .status(403)
        .json({ error: "Access denied. Super Admin only." });
    }

    const { name, slug, description, industry, logo_url } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "Name and slug are required" });
    }

    // Step 1 — Create the organization
    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name,
        slug,
        description,
        industry,
        logo_url,
        owner_admin_id: req.user.id,
        is_active: true,
      })
      .select()
      .single();

    if (orgError) {
      // handle duplicate slug
      if (orgError.code === "23505") {
        return res
          .status(400)
          .json({ error: "Slug already exists. Choose a different one." });
      }
      throw orgError;
    }

    // Step 2 — Link the Super Admin as owner in org_admin_members
    const { error: memberError } = await supabaseAdmin
      .from("org_admin_members")
      .insert({
        org_id: org.id,
        admin_user_id: req.user.id,
        role: "owner",
        is_active: true,
      });

    if (memberError) throw memberError;

    res.status(201).json({
      message: "Organization created successfully",
      organization: org,
    });
  } catch (err) {
    console.error("createOrganization error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Get Organization Details ───────────────────────────────
// GET /api/organizations/:orgId
// Access: Any admin role in the org
const getOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;

    // check if user belongs to this org OR is super admin
    const role = await getOrgRole(req.user.id, orgId);
    const superAdmin = await isSuperAdmin(req.user.id);

    if (!role && !superAdmin) {
      return res.status(403).json({ error: "Access denied." });
    }

    const { data, error } = await supabaseAdmin
      .from("organizations")
      .select(
        `
        *,
        owner:admin_users(id, full_name, email),
        members:org_admin_members(
          id,
          role,
          joined_at,
          admin_user:admin_users(id, full_name, email, avatar_url)
        )
      `,
      )
      .eq("id", orgId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json({ organization: data });
  } catch (err) {
    console.error("getOrganization error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Update Organization ────────────────────────────────────
// PUT /api/organizations/:orgId
// Access: Org Admin (owner) only
const updateOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { name, description, industry, logo_url } = req.body;

    // only owner can update
    const role = await getOrgRole(req.user.id, orgId);
    const superAdmin = await isSuperAdmin(req.user.id);

    if (role !== "owner" && !superAdmin) {
      return res.status(403).json({ error: "Access denied. Org owner only." });
    }

    const { data, error } = await supabaseAdmin
      .from("organizations")
      .update({ name, description, industry, logo_url })
      .eq("id", orgId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "Organization updated successfully",
      organization: data,
    });
  } catch (err) {
    console.error("updateOrganization error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Deactivate Organization ────────────────────────────────
// DELETE /api/organizations/:orgId
// Access: Super Admin only
const deleteOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;

    const superAdmin = await isSuperAdmin(req.user.id);
    if (!superAdmin) {
      return res
        .status(403)
        .json({ error: "Access denied. Super Admin only." });
    }

    // soft delete — set is_active = false
    const { data, error } = await supabaseAdmin
      .from("organizations")
      .update({ is_active: false })
      .eq("id", orgId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "Organization deactivated successfully",
      organization: data,
    });
  } catch (err) {
    console.error("deleteOrganization error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── List Org Members ───────────────────────────────────────
// GET /api/organizations/:orgId/members
// Access: read | edit roles
const listOrgMembers = async (req, res) => {
  try {
    const { orgId } = req.params;

    const role = await getOrgRole(req.user.id, orgId);
    const superAdmin = await isSuperAdmin(req.user.id);

    if (!role && !superAdmin) {
      return res.status(403).json({ error: "Access denied." });
    }

    const { data, error } = await supabaseAdmin
      .from("org_admin_members")
      .select(
        `
        id,
        role,
        is_active,
        joined_at,
        admin_user:admin_users(id, full_name, email, avatar_url, last_login_at)
      `,
      )
      .eq("org_id", orgId)
      .eq("is_active", true)
      .order("joined_at", { ascending: false });

    if (error) throw error;

    res.json({ members: data });
  } catch (err) {
    console.error("listOrgMembers error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Remove Member ──────────────────────────────────────────
// DELETE /api/organizations/:orgId/members/:memberId
// Access: Org Admin (owner) only
const removeMember = async (req, res) => {
  try {
    const { orgId, memberId } = req.params;

    const role = await getOrgRole(req.user.id, orgId);
    const superAdmin = await isSuperAdmin(req.user.id);

    if (role !== "owner" && !superAdmin) {
      return res.status(403).json({ error: "Access denied. Org owner only." });
    }

    // prevent removing yourself
    if (memberId === req.user.id) {
      return res
        .status(400)
        .json({ error: "You cannot remove yourself from the org." });
    }

    // soft delete — set is_active = false
    const { error } = await supabaseAdmin
      .from("org_admin_members")
      .update({ is_active: false })
      .eq("org_id", orgId)
      .eq("admin_user_id", memberId);

    if (error) throw error;

    res.json({ message: "Member removed successfully" });
  } catch (err) {
    console.error("removeMember error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  listOrganizations,
  createOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  listOrgMembers,
  removeMember,
};
