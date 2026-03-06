const { supabaseAdmin } = require("../config/db");
const { logActivity } = require("../services/activity.service");
const { notifyCommentAdded } = require("../services/notification.service");

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getAdminUser(userId) {
  const { data } = await supabaseAdmin
    .from("admin_users")
    .select("id, full_name, email")
    .eq("id", userId)
    .single();
  return data;
}

async function getPublicUser(userId) {
  const { data } = await supabaseAdmin
    .from("public_users")
    .select("id, full_name, email")
    .eq("id", userId)
    .single();
  return data;
}

async function getOrgMember(userId, orgId) {
  const { data } = await supabaseAdmin
    .from("org_admin_members")
    .select("role")
    .eq("admin_user_id", userId)
    .eq("org_id", orgId)
    .eq("is_active", true)
    .single();
  return data;
}

// ─── Controller Functions ─────────────────────────────────────────────────────

// GET /api/issues/:issueId/comments
exports.getComments = async (req, res) => {
  try {
    const { issueId } = req.params;
    const userId = req.user.id;

    const isAdmin = await getAdminUser(userId);

    let query = supabaseAdmin
      .from("issue_comments")
      .select(
        `
                *,
                admin_author:admin_users(id, full_name, avatar_url),
                public_author:public_users(id, full_name, avatar_url)
            `,
      )
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (!isAdmin) {
      // Public users only see non-internal comments
      query = query.eq("is_internal", false);
    }

    const { data: comments, error } = await query;
    if (error) throw error;

    return res.json({ comments: comments || [] });
  } catch (err) {
    console.error("getComments error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// POST /api/issues/:issueId/comments
exports.addComment = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { content, is_internal = false } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required." });
    }

    const adminUser = await getAdminUser(userId);
    const publicUser = !adminUser ? await getPublicUser(userId) : null;

    if (!adminUser && !publicUser) {
      return res.status(403).json({ error: "Unauthorized." });
    }

    // Enforce is_internal = false for public users
    const finalIsInternal = adminUser ? is_internal : false;

    const { data: comment, error } = await supabaseAdmin
      .from("issue_comments")
      .insert({
        issue_id: issueId,
        author_id: userId,
        author_type: adminUser ? "admin_user" : "public_user",
        content: content.trim(),
        is_internal: finalIsInternal,
      })
      .select()
      .single();

    if (error) throw error;

    // Log Activity
    await logActivity({
      issueId,
      actorId: userId,
      actorType: adminUser ? "admin_user" : "public_user",
      action: "COMMENT_ADDED",
      newValue: { is_internal: finalIsInternal },
    });

    // Background Notifications
    try {
      const { data: issue } = await supabaseAdmin
        .from("issues")
        .select("title, reported_by, assigned_to")
        .eq("id", issueId)
        .single();

      if (issue) {
        const recipientIds = [];
        if (
          issue.reported_by &&
          issue.reported_by !== userId &&
          !finalIsInternal
        ) {
          recipientIds.push({ id: issue.reported_by, type: "public_user" });
        }
        if (issue.assigned_to && issue.assigned_to !== userId) {
          recipientIds.push({ id: issue.assigned_to, type: "admin_user" });
        }

        if (recipientIds.length > 0) {
          const recipients = await Promise.all(
            recipientIds.map(async (r) => {
              const table =
                r.type === "admin_user" ? "admin_users" : "public_users";
              const { data } = await supabaseAdmin
                .from(table)
                .select("id, email, full_name")
                .eq("id", r.id)
                .single();
              return { ...data, type: r.type };
            }),
          );

          notifyCommentAdded({
            recipients: recipients.filter((r) => r.email), // ensure we have email
            issue_id: issueId,
            issueTitle: issue.title,
            commenterName:
              adminUser?.full_name || publicUser?.full_name || "Someone",
            commentPreview: content.trim().substring(0, 150),
          }).catch((err) =>
            console.error("[Notification Error] notifyCommentAdded:", err),
          );
        }
      }
    } catch (nErr) {
      console.error("[Notification Error] Comment hook failed:", nErr);
    }

    return res.status(201).json({ comment });
  } catch (err) {
    console.error("addComment error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// PUT /api/issues/:issueId/comments/:commentId
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Content is required." });
    }

    // Verify author
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("issue_comments")
      .select("author_id")
      .eq("id", commentId)
      .single();

    if (fetchErr || !existing)
      return res.status(404).json({ error: "Comment not found." });
    if (existing.author_id !== userId)
      return res
        .status(403)
        .json({ error: "You can only edit your own comments." });

    const { data: updated, error } = await supabaseAdmin
      .from("issue_comments")
      .update({ content: content.trim() })
      .eq("id", commentId)
      .select()
      .single();

    if (error) throw error;

    return res.json({ comment: updated });
  } catch (err) {
    console.error("updateComment error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// DELETE /api/issues/:issueId/comments/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const { data: comment, error: fetchErr } = await supabaseAdmin
      .from("issue_comments")
      .select("*, issues(org_id)")
      .eq("id", commentId)
      .single();

    if (fetchErr || !comment)
      return res.status(404).json({ error: "Comment not found." });

    // Permission check: Author OR Org Admin
    const isAuthor = comment.author_id === userId;
    const orgId = comment.issues?.org_id;

    let canDelete = isAuthor;
    if (!canDelete && orgId) {
      const member = await getOrgMember(userId, orgId);
      if (member && ["owner", "edit"].includes(member.role)) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      return res
        .status(403)
        .json({ error: "Insufficient permissions to delete this comment." });
    }

    const { error: delErr } = await supabaseAdmin
      .from("issue_comments")
      .delete()
      .eq("id", commentId);

    if (delErr) throw delErr;

    return res.json({ message: "Comment deleted successfully." });
  } catch (err) {
    console.error("deleteComment error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
