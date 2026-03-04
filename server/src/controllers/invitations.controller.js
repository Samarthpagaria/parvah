const { supabaseAdmin } = require("../config/db");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

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

// ── Helper: Get user's role in org ────────────────────────
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

// ── Send Invite ────────────────────────────────────────────
const sendInvite = async (req, res) => {
  try {
    const { org_id, invitee_email, role } = req.body;

    if (!org_id || !invitee_email || !role) {
      return res
        .status(400)
        .json({ error: "org_id, invitee_email and role are required" });
    }

    const senderRole = await getOrgRole(req.user.id, org_id);
    if (!senderRole || !["owner", "edit"].includes(senderRole)) {
      return res.status(403).json({ error: "Access denied." });
    }

    const rawToken = crypto.randomUUID();
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

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

    if (error) throw error;

    const signature = signToken(invitation.id, rawToken);
    const signedToken = `${invitation.id}.${rawToken}.${signature}`;

    console.log(
      `📧 Invite link: ${process.env.FRONTEND_URL}/admin/accept-invite?token=${signedToken}`,
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
    console.error("sendInvite error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── List Invites for an Org ────────────────────────────────
const listInvites = async (req, res) => {
  try {
    const { orgId } = req.params;

    const senderRole = await getOrgRole(req.user.id, orgId);
    if (!senderRole || !["owner", "edit"].includes(senderRole)) {
      return res
        .status(403)
        .json({ error: "Access denied. edit role or above required." });
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
    if (!senderRole || !["owner", "edit"].includes(senderRole)) {
      return res.status(403).json({ error: "Access denied." });
    }

    if (invitation.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending invitations can be revoked." });
    }

    const { error } = await supabaseAdmin
      .from("admin_invitations")
      .update({ status: "revoked" })
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

    const { error: memberError } = await supabaseAdmin
      .from("org_admin_members")
      .insert({
        org_id: invitation.org_id,
        admin_user_id: userId,
        role: invitation.role,
        invited_by: invitation.invited_by,
      });

    if (memberError && memberError.code !== "23505") throw memberError;

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

module.exports = {
  sendInvite,
  listInvites,
  revokeInvite,
  verifyToken,
  acceptInvite,
};
