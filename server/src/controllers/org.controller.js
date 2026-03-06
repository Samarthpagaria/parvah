const { supabaseAdmin } = require("../config/db");

// ── Helper: Check if user is Super Admin ───────────────────
const isSuperAdmin = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .select("is_super_admin")
      .eq("id", userId)
      .single();
    if (error) {
      console.error(`[isSuperAdmin] check error for ${userId}:`, error.message);
      return false;
    }
    const result = data?.is_super_admin === true;
    console.log(`[isSuperAdmin] user=${userId} | result=${result}`);
    return result;
  } catch (err) {
    console.error(`[isSuperAdmin] catch error for ${userId}:`, err.message);
    return false;
  }
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
  const role = data?.role || null;
  console.log(`[getOrgRole] user=${userId} | org=${orgId} | role=${role}`);
  return role;
};

// ── List All Organizations ─────────────────────────────────
// GET /api/organizations
// Access: Super Admin only
const listOrganizations = async (req, res) => {
  try {
    const userId = req.user.id;
    const superAdmin = await isSuperAdmin(userId);

    console.log(`[listOrganizations] user=${userId} | superAdmin=${superAdmin}`);

    let query = supabaseAdmin
      .from("organizations")
      .select(`
        *,
        owner:admin_users!owner_admin_id(id, full_name, email)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // if not super admin, filter by memberships
    if (!superAdmin) {
      const { data: memberships, error: memError } = await supabaseAdmin
        .from("org_admin_members")
        .select("org_id")
        .eq("admin_user_id", userId)
        .eq("is_active", true);

      if (memError) throw memError;

      const orgIds = (memberships || []).map(m => m.org_id);

      if (orgIds.length === 0) {
        return res.json({ organizations: [] });
      }

      query = query.in("id", orgIds);
    }

    const { data: orgs, error } = await query;
    if (error) throw error;

    // Fetch counts for all orgs in parallel for performance
    const orgsWithStats = await Promise.all((orgs || []).map(async (org) => {
      const [{ count: issueCount }, { count: memberCount }] = await Promise.all([
        supabaseAdmin
          .from('issues')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', org.id),
        supabaseAdmin
          .from('org_admin_members')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', org.id)
          .eq('is_active', true)
      ]);

      return {
        ...org,
        stats: {
          issues: issueCount || 0,
          members: memberCount || 0
        }
      };
    }));

    res.json({ organizations: orgsWithStats });
  } catch (err) {
    console.error("listOrganizations error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

// ── Create Organization ────────────────────────────────────
// POST /api/organizations
// Access: Super Admin only
const createOrganization = async (req, res) => {
  try {
    const userId = req.user.id;
    // DECENTRALIZED: Any authenticated admin_user can create an organization
    // const superAdmin = await isSuperAdmin(userId);
    // if (!superAdmin) { ... }

    const { name, slug, description, industry, logo_url, join_code } = req.body;
    console.log(`[createOrganization:PAYLOAD] name=${name} slug=${slug} join_code=${join_code}`);

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
        join_code,
        owner_admin_id: userId,
        is_active: true,
      })
      .select()
      .single();

    if (orgError) {
      if (orgError.code === "23505") {
        return res
          .status(400)
          .json({ error: "Organization with this slug or join code already exists." });
      }
      throw orgError;
    }

    console.log(`[createOrganization:SUCCESS] org=${org.id} name=${org.name}`);

    // Step 2 — Link the creator as 'owner' in org_admin_members
    const { error: memberError } = await supabaseAdmin
      .from("org_admin_members")
      .insert({
        org_id: org.id,
        admin_user_id: userId,
        role: "owner",
        is_active: true,
      });

    if (memberError) throw memberError;

    res.status(201).json({
      message: "Organization created successfully",
      organization: org,
    });
  } catch (err) {
    console.error("createOrganization error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
      code: err.code
    });
  }
};

// ── Get Organization Details ───────────────────────────────
// GET /api/organizations/:orgId
// Access: Any admin role in the org
const getOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    const userId = req.user.id;

    // check if user belongs to this org OR is super admin
    const role = await getOrgRole(userId, orgId);
    const superAdmin = await isSuperAdmin(userId);

    if (!role && !superAdmin) {
      console.warn(`[getOrganization:DENIED] user=${userId} org=${orgId}`);
      return res.status(403).json({ error: "Access denied." });
    }

    console.log(`[getOrganization] user=${userId} org=${orgId}`);
    const { data, error } = await supabaseAdmin
      .from("organizations")
      .select(
        `
        *,
        owner:admin_users!owner_admin_id(id, full_name, email),
        members:org_admin_members(
          id,
          role,
          joined_at,
          admin_user:admin_users!admin_user_id(id, full_name, email, avatar_url)
        )
      `,
      )
      .eq("id", orgId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json({ organization: data, my_role: role });
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
    const userId = req.user.id;

    // only owner can update
    const role = await getOrgRole(userId, orgId);
    const superAdmin = await isSuperAdmin(userId);

    if (role !== "owner" && !superAdmin) {
      console.warn(`[updateOrganization:DENIED] user=${userId} org=${orgId} role=${role}`);
      return res.status(403).json({ error: "Access denied. Org owner only." });
    }

    console.log(`[updateOrganization:DB_UPDATE] org=${orgId} by=${userId}`);
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
    const userId = req.user.id;

    const role = await getOrgRole(userId, orgId);
    const superAdmin = await isSuperAdmin(userId);

    if (role !== "owner" && !superAdmin) {
      return res
        .status(403)
        .json({ error: "Access denied. Org owner only (or Super Admin)." });
    }

    console.log(`[deleteOrganization] org=${orgId} by=${userId}`);
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
    const userId = req.user.id;

    const role = await getOrgRole(userId, orgId);
    const superAdmin = await isSuperAdmin(userId);

    if (!role && !superAdmin) {
      console.warn(`[listOrgMembers:DENIED] user=${userId} org=${orgId}`);
      return res.status(403).json({ error: "Access denied." });
    }

    console.log(`[listOrgMembers] user=${userId} org=${orgId}`);
    const { data, error } = await supabaseAdmin
      .from("org_admin_members")
      .select(
        `
        id,
        role,
        is_active,
        joined_at,
        admin_user_id,
        admin_user:admin_users!admin_user_id(id, full_name, email, avatar_url, last_login_at)
      `,
      )
      .eq("org_id", orgId)
      .eq("is_active", true)
      .order("joined_at", { ascending: false });

    if (error) throw error;

    // Post-process to ensure no "Unknown" fields reach the frontend if possible
    const sanitizedMembers = (data || []).map(m => ({
      ...m,
      admin_user: m.admin_user || {
        id: m.admin_user_id,
        full_name: "Unknown Admin",
        email: "unknown@parvah.gov",
        avatar_url: null
      }
    }));

    res.json({ members: sanitizedMembers });
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
    const userId = req.user.id;

    const role = await getOrgRole(userId, orgId);
    const superAdmin = await isSuperAdmin(userId);

    if (role !== "owner" && !superAdmin) {
      return res.status(403).json({ error: "Access denied. Org owner only." });
    }

    // prevent removing yourself
    if (memberId === userId) {
      return res
        .status(400)
        .json({ error: "You cannot remove yourself from the org." });
    }

    console.log(`[removeMember] org=${orgId} target=${memberId} by=${userId}`);
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

// ── List Org Categories ────────────────────────────────────
// GET /api/organizations/:orgId/categories
const listOrgCategories = async (req, res) => {
  try {
    const { orgId } = req.params;
    const userId = req.user.id;
    const role = await getOrgRole(userId, orgId);
    const superAdmin = await isSuperAdmin(userId);

    if (!role && !superAdmin) {
      console.warn(`[listOrgCategories:DENIED] user=${userId} org=${orgId}`);
      return res.status(403).json({ error: "Access denied." });
    }

    console.log(`[listOrgCategories] user=${userId} org=${orgId}`);
    const { data: categories, error } = await supabaseAdmin
      .from("issue_categories")
      .select("*")
      .eq("org_id", orgId)
      .order("name");

    if (error) throw error;

    res.json({ categories });
  } catch (err) {
    console.error("listOrgCategories error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Create Org Category ────────────────────────────────────
// POST /api/organizations/:orgId/categories
const createOrgCategory = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { name, color, description } = req.body;
    const userId = req.user.id;

    const role = await getOrgRole(userId, orgId);
    const superAdmin = await isSuperAdmin(userId);
    if (!superAdmin && !["owner", "staff"].includes(role)) {
      console.warn(`[createOrgCategory:DENIED] user=${userId} org=${orgId} role=${role}`);
      return res.status(403).json({ error: "Access denied. Org owner or staff only." });
    }

    console.log(`[createOrgCategory:DB_INSERT] org=${orgId} name=${name} by=${userId}`);
    const { data, error } = await supabaseAdmin
      .from("issue_categories")
      .insert({ org_id: orgId, name, color })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ category: data });
  } catch (err) {
    console.error("createOrgCategory error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Delete Org Category ────────────────────────────────────
// DELETE /api/organizations/:orgId/categories/:catId
const deleteOrgCategory = async (req, res) => {
  try {
    const { orgId, catId } = req.params;
    const userId = req.user.id;

    const role = await getOrgRole(userId, orgId);
    const superAdmin = await isSuperAdmin(userId);
    if (!superAdmin && role !== "owner") {
      return res.status(403).json({ error: "Access denied. Org owner only." });
    }

    console.log(`[deleteOrgCategory] org=${orgId} cat=${catId} by=${userId}`);
    const { error } = await supabaseAdmin
      .from("issue_categories")
      .delete()
      .eq("id", catId)
      .eq("org_id", orgId);

    if (error) throw error;

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("deleteOrgCategory error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── List My Org Categories (for Public Users) ────────────────────────────────
// GET /api/organizations/categories/mine
// Access: Authenticated public users
const listMyCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    // Look up the public user's org_id
    const { data: publicUser } = await supabaseAdmin
      .from('public_users')
      .select('org_id')
      .eq('id', userId)
      .single();

    if (!publicUser || !publicUser.org_id) {
      console.warn(`[listMyCategories:NO_ORG] user=${userId}`);
      return res.status(400).json({ error: 'Your account is not linked to any organization.' });
    }

    console.log(`[listMyCategories] user=${userId} org=${publicUser.org_id}`);
    const { data: categories, error } = await supabaseAdmin
      .from('issue_categories')
      .select('id, name, color, icon')
      .eq('org_id', publicUser.org_id)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    res.json({ categories: categories || [] });
  } catch (err) {
    console.error('listMyCategories error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
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
  listOrgCategories,
  createOrgCategory,
  deleteOrgCategory,
  listMyCategories,
};
