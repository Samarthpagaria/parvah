require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./src/config/env");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Middleware ────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Parvah backend is running",
    timestamp: new Date().toISOString(),
  });
});

// ── Routes (added one by one as we build) ─────────────────
app.use("/api/auth", require("./src/routes/auth.routes"));
// app.use('/api/organizations', require('./src/routes/org.routes'))
// app.use('/api/invitations', require('./src/routes/invite.routes'))
// app.use('/api/issues', require('./src/routes/issues.routes'))
// app.use('/api/analytics', require('./src/routes/analytics.routes'))

// ── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// ── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// ── Start Server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ CivicTrack backend running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
