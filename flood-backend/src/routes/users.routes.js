
const express = require("express");

const router = express.Router();

// =========================================================
// CONTROLLERS
// =========================================================

const {
  getUsers,
  createUser,
  updateUser,
  disableUser,
  enableUser,
} = require("../controllers/users.controller");

// =========================================================
// AUTHENTICATION / AUTHORIZATION
// =========================================================

const {
  authenticate,
  requireAdmin,
} = require("../middleware/auth.middleware");


// =========================================================
// GET ALL USERS
// GET /api/users
// ADMIN ONLY
// =========================================================

router.get(
  "/",
  authenticate,
  requireAdmin,
  getUsers
);


// =========================================================
// CREATE USER
// POST /api/users
// ADMIN ONLY
// =========================================================

router.post(
  "/",
  authenticate,
  requireAdmin,
  createUser
);


// =========================================================
// UPDATE USER
// PUT /api/users/:id
// ADMIN ONLY
// =========================================================

router.put(
  "/:id",
  authenticate,
  requireAdmin,
  updateUser
);


// =========================================================
// DISABLE USER
// PATCH /api/users/:id/disable
// ADMIN ONLY
// =========================================================

router.patch(
  "/:id/disable",
  authenticate,
  requireAdmin,
  disableUser
);


// =========================================================
// ENABLE USER
// PATCH /api/users/:id/enable
// ADMIN ONLY
// =========================================================

router.patch(
  "/:id/enable",
  authenticate,
  requireAdmin,
  enableUser
);


// =========================================================
// EXPORT ROUTER
// =========================================================

module.exports = router;
