const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  loginAdmin,
  loginPublicUser,
  registerPublicUser,
  registerAdmin,
  logout,
  getMe,
  updateProfile,
} = require("../controllers/auth.controllers");

// Public routes (no JWT needed)
router.post("/admin/login", loginAdmin);
router.post("/admin/register", registerAdmin);
router.post("/public/login", loginPublicUser);
router.post("/public/register", registerPublicUser);

// Protected routes (JWT required)
router.get("/me", auth, getMe);
router.put("/profile", auth, updateProfile);
router.post("/logout", auth, logout);

module.exports = router;
