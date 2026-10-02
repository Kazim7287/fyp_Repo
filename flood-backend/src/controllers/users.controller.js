
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const {
  createSystemLog,
} = require("../services/systemLogService");

// =========================================================
// HELPERS
// =========================================================

const getClientIp = (req) => {
  return (
    req.ip ||
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    null
  );
};

const getUserAgent = (req) => {
  return req.get("user-agent") || null;
};

const getAuditUserId = (req) => {
  return req.user?.id || null;
};

const getAuditUserName = (req) => {
  return (
    req.user?.name ||
    req.user?.email ||
    "Unknown"
  );
};

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

    const normalizedEmail = email
      .trim()
      .toLowerCase();

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

    const createdUser = result.rows[0];

    // -------------------------------------------------------
    // SYSTEM AUDIT LOG — CREATE USER
    // -------------------------------------------------------

    await createSystemLog({
      // Admin who performed the action
      userId: getAuditUserId(req),
      userName: getAuditUserName(req),

      action: "CREATE",

      module: "User Management",

      resourceType: "user",

      // User who was created
      resourceId: createdUser.id,

      description:
        `User account "${createdUser.name}" was created.`,

      oldValues: null,

      newValues: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        status: createdUser.status,
      },

      ipAddress: getClientIp(req),

      userAgent: getUserAgent(req),

      status: "Success",

      severity: "Info",
    });

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: createdUser,
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

    const normalizedEmail = email
      .trim()
      .toLowerCase();

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
        name,
        email,
        role,
        status,
        created_at
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

    const oldUser = existingUser.rows[0];

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

    const updatedUser = result.rows[0];

    // -------------------------------------------------------
    // SYSTEM AUDIT LOG — UPDATE USER
    // -------------------------------------------------------

    await createSystemLog({
      // Admin who performed the action
      userId: getAuditUserId(req),
      userName: getAuditUserName(req),

      action: "UPDATE",

      module: "User Management",

      resourceType: "user",

      // User who was updated
      resourceId: updatedUser.id,

      description:
        `User account "${updatedUser.name}" was updated.`,

      oldValues: {
        id: oldUser.id,
        name: oldUser.name,
        email: oldUser.email,
        role: oldUser.role,
        status: oldUser.status,
      },

      newValues: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      },

      ipAddress: getClientIp(req),

      userAgent: getUserAgent(req),

      status: "Success",

      severity: "Info",
    });

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
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
        name,
        email,
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

    const oldUser = existingUser.rows[0];

    // -------------------------------------------------------
    // PREVENT DISABLING ALREADY DISABLED USER
    // -------------------------------------------------------

    if (
      oldUser.status === "disabled"
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

    const disabledUser = result.rows[0];

    // -------------------------------------------------------
    // SYSTEM AUDIT LOG — DISABLE USER
    // -------------------------------------------------------

    await createSystemLog({
      // Admin who performed the action
      userId: getAuditUserId(req),
      userName: getAuditUserName(req),

      action: "DISABLE",

      module: "User Management",

      resourceType: "user",

      // User who was disabled
      resourceId: disabledUser.id,

      description:
        `User account "${disabledUser.name}" was disabled.`,

      oldValues: {
        id: oldUser.id,
        name: oldUser.name,
        email: oldUser.email,
        role: oldUser.role,
        status: oldUser.status,
      },

      newValues: {
        id: disabledUser.id,
        name: disabledUser.name,
        email: disabledUser.email,
        role: disabledUser.role,
        status: disabledUser.status,
      },

      ipAddress: getClientIp(req),

      userAgent: getUserAgent(req),

      status: "Success",

      severity: "Warning",
    });

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "User disabled successfully",
      user: disabledUser,
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
        name,
        email,
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

    const oldUser = existingUser.rows[0];

    // -------------------------------------------------------
    // PREVENT ENABLING ALREADY ACTIVE USER
    // -------------------------------------------------------

    if (
      oldUser.status === "active"
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

    const enabledUser = result.rows[0];

    // -------------------------------------------------------
    // SYSTEM AUDIT LOG — ENABLE USER
    // -------------------------------------------------------

    await createSystemLog({
      // Admin who performed the action
      userId: getAuditUserId(req),
      userName: getAuditUserName(req),

      action: "ENABLE",

      module: "User Management",

      resourceType: "user",

      // User who was enabled
      resourceId: enabledUser.id,

      description:
        `User account "${enabledUser.name}" was enabled.`,

      oldValues: {
        id: oldUser.id,
        name: oldUser.name,
        email: oldUser.email,
        role: oldUser.role,
        status: oldUser.status,
      },

      newValues: {
        id: enabledUser.id,
        name: enabledUser.name,
        email: enabledUser.email,
        role: enabledUser.role,
        status: enabledUser.status,
      },

      ipAddress: getClientIp(req),

      userAgent: getUserAgent(req),

      status: "Success",

      severity: "Info",
    });

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "User enabled successfully",
      user: enabledUser,
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
