
const bcrypt = require("bcrypt");
const pool = require("../config/db");

// =========================================================
// GET ALL USERS
// GET /api/users
// ADMIN ONLY
// =========================================================

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        role,
        status,
        created_at
      FROM users
      ORDER BY id ASC
    `);

    return res.status(200).json({
      success: true,
      users: result.rows,
    });

  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};


// =========================================================
// CREATE USER
// POST /api/users
// ADMIN ONLY
// =========================================================

const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (
      !name ||
      !email ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and role are required",
      });
    }

    // -------------------------------------------------------
    // NORMALIZE DATA
    // -------------------------------------------------------

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // -------------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------------

    if (normalizedName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must contain at least 2 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters",
      });
    }

    // -------------------------------------------------------
    // VALIDATE ROLE
    // -------------------------------------------------------

    const allowedRoles = [
      "admin",
      "common_user",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    // -------------------------------------------------------
    // CHECK EMAIL
    // -------------------------------------------------------

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      `,
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "A user with this email already exists",
      });
    }

    // -------------------------------------------------------
    // HASH PASSWORD
    // -------------------------------------------------------

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    // -------------------------------------------------------
    // CREATE USER
    // -------------------------------------------------------

    const result = await pool.query(
      `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        'active'
      )
      RETURNING
        id,
        name,
        email,
        role,
        status,
        created_at
      `,
      [
        normalizedName,
        normalizedEmail,
        passwordHash,
        role,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Create user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};


// =========================================================
// UPDATE USER
// PUT /api/users/:id
// ADMIN ONLY
// =========================================================

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      role,
    } = req.body;

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (
      !name ||
      !email ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and role are required",
      });
    }

    // -------------------------------------------------------
    // NORMALIZE DATA
    // -------------------------------------------------------

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must contain at least 2 characters",
      });
    }

    // -------------------------------------------------------
    // VALIDATE ROLE
    // -------------------------------------------------------

    const allowedRoles = [
      "admin",
      "common_user",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    // -------------------------------------------------------
    // CHECK USER
    // -------------------------------------------------------

    const existingUser = await pool.query(
      `
      SELECT
        id,
        role,
        status
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -------------------------------------------------------
    // CHECK EMAIL
    // -------------------------------------------------------

    const emailCheck = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      AND id <> $2
      `,
      [
        normalizedEmail,
        id,
      ]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Email is already used by another user",
      });
    }

    // -------------------------------------------------------
    // UPDATE USER
    // -------------------------------------------------------

    const result = await pool.query(
      `
      UPDATE users
      SET
        name = $1,
        email = $2,
        role = $3
      WHERE id = $4
      RETURNING
        id,
        name,
        email,
        role,
        status,
        created_at
      `,
      [
        normalizedName,
        normalizedEmail,
        role,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Update user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};


// =========================================================
// DISABLE USER
// PATCH /api/users/:id/disable
// ADMIN ONLY
// =========================================================

const disableUser = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------------
    // CHECK USER
    // -------------------------------------------------------

    const existingUser = await pool.query(
      `
      SELECT
        id,
        role,
        status
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -------------------------------------------------------
    // PREVENT DISABLING ALREADY DISABLED USER
    // -------------------------------------------------------

    if (
      existingUser.rows[0].status === "disabled"
    ) {
      return res.status(400).json({
        success: false,
        message: "User is already disabled",
      });
    }

    // -------------------------------------------------------
    // DISABLE USER
    // -------------------------------------------------------

    const result = await pool.query(
      `
      UPDATE users
      SET status = 'disabled'
      WHERE id = $1
      RETURNING
        id,
        name,
        email,
        role,
        status
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "User disabled successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Disable user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to disable user",
    });
  }
};


// =========================================================
// ENABLE USER
// PATCH /api/users/:id/enable
// ADMIN ONLY
// =========================================================

const enableUser = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------------
    // CHECK USER
    // -------------------------------------------------------

    const existingUser = await pool.query(
      `
      SELECT
        id,
        role,
        status
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -------------------------------------------------------
    // PREVENT ENABLING ALREADY ACTIVE USER
    // -------------------------------------------------------

    if (
      existingUser.rows[0].status === "active"
    ) {
      return res.status(400).json({
        success: false,
        message: "User is already active",
      });
    }

    // -------------------------------------------------------
    // ENABLE USER
    // -------------------------------------------------------

    const result = await pool.query(
      `
      UPDATE users
      SET status = 'active'
      WHERE id = $1
      RETURNING
        id,
        name,
        email,
        role,
        status
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "User enabled successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Enable user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to enable user",
    });
  }
};


// =========================================================
// EXPORT CONTROLLERS
// =========================================================

module.exports = {
  getUsers,
  createUser,
  updateUser,
  disableUser,
  enableUser,
};