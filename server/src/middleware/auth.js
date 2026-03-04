const { supabaseAdmin } = require("../config/db");

const auth = async (req, res, next) => {
  try {
    // ── Step 1: Get token from request header ────────────
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // extract token after "Bearer "

    // ── Step 2: Verify token with Supabase ───────────────
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // ── Step 3: Attach user to request ───────────────────
    // Now every route that uses this middleware can access req.user
    req.user = user;
    req.token = token;

    next(); // move to the actual route handler
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ error: "Authentication failed" });
  }
};

module.exports = auth;
