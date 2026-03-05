const { supabaseAdmin } = require("../config/db");

/**
 * requireAdmin
 * Ensures the authenticated user exists in the admin_users table and is active.
 * Must be used AFTER the authenticate middleware.
 * Attaches req.adminUser for downstream use.
 */
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const { data: adminUser, error } = await supabaseAdmin
      .from("admin_users")
      .select("id, email, full_name, is_super_admin, is_active")
      .eq("id", userId)
      .single();

    if (error || !adminUser) {
      return res
        .status(403)
        .json({ error: "Access denied. Admin account not found." });
    }

    if (!adminUser.is_active) {
      return res
        .status(403)
        .json({ error: "Access denied. Admin account is inactive." });
    }

    req.adminUser = adminUser;
    next();
  } catch (err) {
    console.error("requireAdmin middleware error:", err);
    return res.status(500).json({ error: "Authorization check failed." });
  }
};

module.exports = { requireAdmin };
