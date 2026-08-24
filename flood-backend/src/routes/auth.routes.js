const express = require("express");

const router = express.Router();

const {
  register,
  login,
  getCurrentUser,
  logout,
} = require("../controllers/auth.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

// =========================================================
// REGISTER
// POST /api/auth/register
// =========================================================

router.post(
  "/register",
  register
);

// =========================================================
// LOGIN
// POST /api/auth/login
// =========================================================

router.post(
  "/login",
  login
);

// =========================================================
// CURRENT USER
// GET /api/auth/me
// =========================================================

router.get(
  "/me",
  authenticate,
  getCurrentUser
);

// =========================================================
// LOGOUT
// POST /api/auth/logout
// =========================================================

router.post(
  "/logout",
  authenticate,
  logout
);

module.exports = router;