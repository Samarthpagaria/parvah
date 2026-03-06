const { supabaseAdmin } = require("../config/db");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sendNotification } = require("../services/notification.service");

// ── Helper: Generate signature ─────────────────────────────
const signToken = (inviteId, rawToken) => {
  return crypto
    .createHmac("sha256", process.env.INVITE_TOKEN_SECRET)
    .update(`${inviteId}.${rawToken}`)
    .digest("hex");
};

// ── Helper: Verify signed token ───────────────────────────
const verifySignedToken = (signedToken) => {
  const [inviteId, rawToken, signature] = signedToken.split(".");

  if (!inviteId || !rawToken || !signature) return null;

  const expectedSignature = signToken(inviteId, rawToken);

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );

  return isValid ? { inviteId, rawToken } : null;
};

// ── Helper: Check if user is Super Admin ───────────────────
const isSuperAdmin = async (userId) => {
  try {
    const { data } = await supabaseAdmin
      .from("admin_users")
      .select("is_super_admin")
      .eq("id", userId)
      .single();
    return data?.is_super_admin === true;
  } catch (err) {
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
  console.log(`[getOrgRole:Invite] user=${userId} | org=${orgId} | role=${role}`);
  return role;
};

// ── Send Invite ────────────────────────────────────────────
const sendInvite = async (req, res) => {
  try {
    const { org_id, invitee_email, role } = req.body;
    console.log(`[sendInvite] Request from ${req.user?.id} for org ${org_id} -> ${invitee_email} as ${role}`);

    if (!org_id || !invitee_email || !role) {
      return res
        .status(400)
        .json({ error: "org_id, invitee_email and role are required" });
    }

    const senderRole = await getOrgRole(req.user.id, org_id);
    const superAdmin = await isSuperAdmin(req.user.id);

    if (!superAdmin && !["owner", "edit"].includes(senderRole)) {
      console.log(`[sendInvite:FORBIDDEN] user=${req.user.id} role=${senderRole} super=${superAdmin}`);
      return res.status(403).json({ error: "Access denied. Org owner/edit required." });
    }

    const allowedTargetRoles = ["edit", "view", "staff"];
    if (!allowedTargetRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Allowed roles are: ${allowedTargetRoles.join(", ")}` });
    }

    // DUPLICATE CHECK: Check if email is already a member
    const { data: existingMember } = await supabaseAdmin
      .from("org_admin_members")
      .select("id")
      .eq("org_id", org_id)
      .eq("is_active", true)
      .filter("admin_user:admin_users!admin_user_id(email)", "eq", invitee_email)
      .maybeSingle();

    // Actually, join filtering in Supabase is tricky. Let's do a direct check via admin_users first.
    const { data: targetUser } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("email", invitee_email)
      .maybeSingle();

    if (targetUser) {
      const { data: memberRecord } = await supabaseAdmin
        .from("org_admin_members")
        .select("id")
        .eq("org_id", org_id)
        .eq("admin_user_id", targetUser.id)
        .eq("is_active", true)
        .maybeSingle();

      if (memberRecord) {
        return res.status(400).json({ error: "This user is already a member of the organization." });
      }
    }

    // PENDING CHECK: Check if a pending invite already exists
    const { data: pendingInvite } = await supabaseAdmin
      .from("admin_invitations")
      .select("id")
      .eq("org_id", org_id)
      .eq("invitee_email", invitee_email)
      .eq("status", "pending")
      .maybeSingle();

    if (pendingInvite) {
      return res.status(400).json({ error: "A pending invitation already exists for this email." });
    }

    const rawToken = crypto.randomUUID();
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    console.log(`[sendInvite:DB_INSERT] Inserting invitation for ${invitee_email}`);
    const { data: invitation, error } = await supabaseAdmin
      .from("admin_invitations")
      .insert({
        org_id,
        invited_by: req.user.id,
        invitee_email,
        role,
        token: tokenHash,
        status: "pending",
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error("[sendInvite:DB_ERROR]", error);
      if (error.code === '23505') {
        return res.status(400).json({ error: "An invitation for this email already exists in this organization." });
      }
      if (error.code === '23503') {
        return res.status(400).json({ error: "Invalid organization ID or sender ID." });
      }
      throw error;
    }

    // Smart Notification: If invitee exists as an admin_user, send in-app notification
    const { data: existingAdmin } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("email", invitee_email)
      .single();

    if (existingAdmin) {
      const { data: orgData } = await supabaseAdmin
        .from("organizations")
        .select("name")
        .eq("id", org_id)
        .single();

      await sendNotification({
        recipientId: existingAdmin.id,
        recipientType: 'admin_user',
        orgId: org_id,
        type: 'ORG_INVITE',
        title: 'New Organization Invitation',
        message: `You have been invited to join "${orgData?.name || 'an organization'}" as ${role}.`,
      });
      console.log(`[sendInvite:NOTIFY] Sent in-app notification to existing admin ${existingAdmin.id}`);
    }

    const signature = signToken(invitation.id, rawToken);
    const signedToken = `${invitation.id}.${rawToken}.${signature}`;

    console.log(
      `📧 Invite link generated for ${invitee_email}`
    );

    res.status(201).json({
      message: "Invitation sent successfully",
      invitation: {
        id: invitation.id,
        invitee_email: invitation.invitee_email,
        role: invitation.role,
      },
      ...(process.env.NODE_ENV === "development" && { dev_token: signedToken }),
    });
  } catch (err) {
    console.error("sendInvite FATAL ERROR:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
      details: err.details || err.hint || null
    });
  }
};

// ── List Invites for an Org ────────────────────────────────
const listInvites = async (req, res) => {
  try {
    const { orgId } = req.params;

    const senderRole = await getOrgRole(req.user.id, orgId);
    const superAdmin = await isSuperAdmin(req.user.id);

    if (!superAdmin && !["owner", "edit", "staff"].includes(senderRole)) {
      return res
        .status(403)
        .json({ error: "Access denied. Org owner/edit/staff required." });
    }

    const { data, error } = await supabaseAdmin
      .from("admin_invitations")
      .select(
        `
        id,
        invitee_email,
        role,
        status,
        expires_at,
        created_at,
        accepted_at,
        invited_by_user:admin_users(id, full_name, email)
      `,
      )
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ invitations: data });
  } catch (err) {
    console.error("listInvites error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Revoke Invite ──────────────────────────────────────────
const revokeInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;

    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from("admin_invitations")
      .select("*")
      .eq("id", inviteId)
      .single();

    if (fetchError || !invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    const senderRole = await getOrgRole(req.user.id, invitation.org_id);
    const superAdmin = await isSuperAdmin(req.user.id);

    if (!superAdmin && !["owner", "edit", "staff"].includes(senderRole)) {
      return res.status(403).json({ error: "Access denied. Org owner/edit/staff required." });
    }

    if (invitation.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending invitations can be revoked." });
    }

    const { error } = await supabaseAdmin
      .from("admin_invitations")
      .delete()
      .eq("id", inviteId);

    if (error) throw error;

    res.json({ message: "Invitation revoked successfully" });
  } catch (err) {
    console.error("revokeInvite error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Verify Token ───────────────────────────────────────────
const verifyToken = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = verifySignedToken(token);
    if (!decoded)
      return res.status(400).json({ error: "Invalid invite token" });

    const { inviteId, rawToken } = decoded;

    const { data: invitation, error } = await supabaseAdmin
      .from("admin_invitations")
      .select(
        `
        *,
        organization:organizations(id, name, slug, logo_url)
      `,
      )
      .eq("id", inviteId)
      .eq("status", "pending")
      .single();

    if (error || !invitation) {
      return res
        .status(404)
        .json({ error: "Invitation not found or already used" });
    }

    const isMatch = await bcrypt.compare(rawToken, invitation.token);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid invite token" });

    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(400).json({ error: "Invite token has expired" });
    }

    res.json({
      valid: true,
      invitation: {
        id: invitation.id,
        invitee_email: invitation.invitee_email,
        role: invitation.role,
        organization: invitation.organization,
      },
    });
  } catch (err) {
    console.error("verifyToken error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Accept Invite ──────────────────────────────────────────
const acceptInvite = async (req, res) => {
  try {
    const { token, full_name, password } = req.body;

    const decoded = verifySignedToken(token);
    if (!decoded) return res.status(400).json({ error: "Invalid token" });

    const { inviteId, rawToken } = decoded;

    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from("admin_invitations")
      .select("*")
      .eq("id", inviteId)
      .eq("status", "pending")
      .single();

    if (fetchError || !invitation)
      return res.status(404).json({ error: "Invitation not found" });

    const isMatch = await bcrypt.compare(rawToken, invitation.token);
    if (!isMatch) return res.status(400).json({ error: "Invalid token" });

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signUp({
        email: invitation.invitee_email,
        password,
      });

    if (authError) return res.status(400).json({ error: authError.message });

    const userId = authData.user.id;

    const { error: adminError } = await supabaseAdmin
      .from("admin_users")
      .upsert({
        id: userId,
        email: invitation.invitee_email,
        full_name,
        is_active: true,
      });

    if (adminError) throw adminError;

    // Link the user to the organization (Manual Upsert to handle reactivation without constraint errors)
    const { data: existingRecord } = await supabaseAdmin
      .from("org_admin_members")
      .select("id")
      .eq("org_id", invitation.org_id)
      .eq("admin_user_id", userId)
      .maybeSingle();

    if (existingRecord) {
      const { error: updateError } = await supabaseAdmin
        .from("org_admin_members")
        .update({
          role: invitation.role,
          invited_by: invitation.invited_by,
          is_active: true,
          joined_at: new Date().toISOString(),
        })
        .eq("id", existingRecord.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabaseAdmin
        .from("org_admin_members")
        .insert({
          org_id: invitation.org_id,
          admin_user_id: userId,
          role: invitation.role,
          invited_by: invitation.invited_by,
          is_active: true,
          joined_at: new Date().toISOString(),
        });
      if (insertError) throw insertError;
    }

    await supabaseAdmin
      .from("admin_invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", inviteId);

    res.status(201).json({ message: "Success! Welcome to the organization." });
  } catch (err) {
    console.error("acceptInvite error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Get My Pending Invites ────────────────────────────────
const getMyInvites = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const { data, error } = await supabaseAdmin
      .from("admin_invitations")
      .select(`
        id,
        invitee_email,
        role,
        status,
        expires_at,
        created_at,
        organization:organizations(id, name, slug, logo_url),
        invited_by_user:admin_users(id, full_name, email)
      `)
      .eq("invitee_email", userEmail)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString());

    if (error) throw error;

    res.json({ invitations: data });
  } catch (err) {
    console.error("getMyInvites error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Accept Invite (Internal) ────────────────────────────────
const acceptInviteForMember = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from("admin_invitations")
      .select("*")
      .eq("id", inviteId)
      .eq("invitee_email", userEmail)
      .eq("status", "pending")
      .single();

    if (fetchError || !invitation) {
      return res.status(404).json({ error: "Invitation not found or not for you." });
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(400).json({ error: "Invitation has expired." });
    }

    // SELF-HEALING: Ensure user has a record in admin_users
    // This handles users who were Public Users and are now joining an Org as Admin
    const { data: adminProfile } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!adminProfile) {
      console.log(`[acceptInviteForMember:SYNC] Creating admin_users record for ${userId}`);
      await supabaseAdmin
        .from("admin_users")
        .insert({
          id: userId,
          email: userEmail,
          full_name: req.user.user_metadata?.full_name || userEmail.split('@')[0],
          is_active: true,
        });
    }

    // Link the user to the organization (Manual Upsert to handle reactivation without constraint errors)
    const { data: existingRecord } = await supabaseAdmin
      .from("org_admin_members")
      .select("id")
      .eq("org_id", invitation.org_id)
      .eq("admin_user_id", userId)
      .maybeSingle();

    if (existingRecord) {
      const { error: updateError } = await supabaseAdmin
        .from("org_admin_members")
        .update({
          role: invitation.role,
          invited_by: invitation.invited_by,
          is_active: true,
          joined_at: new Date().toISOString(),
        })
        .eq("id", existingRecord.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabaseAdmin
        .from("org_admin_members")
        .insert({
          org_id: invitation.org_id,
          admin_user_id: userId,
          role: invitation.role,
          invited_by: invitation.invited_by,
          is_active: true,
          joined_at: new Date().toISOString(),
        });
      if (insertError) throw insertError;
    }

    // Mark as accepted
    await supabaseAdmin
      .from("admin_invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", inviteId);

    res.json({ message: "Successfully joined the organization!" });
  } catch (err) {
    console.error("acceptInviteForMember error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  sendInvite,
  listInvites,
  revokeInvite,
  verifyToken,
  acceptInvite,
  getMyInvites,
  acceptInviteForMember,
};
