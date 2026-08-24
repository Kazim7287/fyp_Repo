const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// =========================================================
// JWT
// =========================================================

const generateAccessToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
};

// =========================================================
// COOKIE OPTIONS
// =========================================================

const getCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,

    secure: isProduction,

    sameSite: isProduction
      ? "none"
      : "lax",

    maxAge: 60 * 60 * 1000,

    path: "/",
  };
};

// =========================================================
// REGISTER
// POST /api/auth/register
// =========================================================

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    const normalizedName = name.trim();

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (normalizedName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be at least 2 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    // =====================================================
    // CHECK EXISTING USER
    // =====================================================

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
        message: "Email already registered",
      });
    }

    // =====================================================
    // HASH PASSWORD
    // =====================================================

    const passwordHash =
      await bcrypt.hash(password, 12);

    // =====================================================
    // CREATE COMMON USER
    //
    // IMPORTANT:
    // Public registration can NEVER create an admin.
    // =====================================================

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
        'common_user',
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
      ]
    );

    const user = result.rows[0];

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
    });

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================================================
// LOGIN
// POST /api/auth/login
// =========================================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // =====================================================
    // FIND USER
    // =====================================================

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        status
      FROM users
      WHERE email = $1
      `,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // =====================================================
    // CHECK ACCOUNT STATUS
    // =====================================================

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled",
      });
    }

    // =====================================================
    // CHECK PASSWORD
    // =====================================================

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // =====================================================
    // GENERATE JWT
    // =====================================================

    const accessToken =
      generateAccessToken(user);

    // =====================================================
    // SET HTTP-ONLY COOKIE
    // =====================================================

    res.cookie(
      "accessToken",
      accessToken,
      getCookieOptions()
    );

    // =====================================================
    // REMOVE PASSWORD HASH
    // =====================================================

    delete user.password_hash;

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      message: "Login successful",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================================================
// GET CURRENT AUTHENTICATED USER
// GET /api/auth/me
// =========================================================

const getCurrentUser = async (req, res) => {
  try {
    // authenticate middleware should populate req.user

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // =====================================================
    // GET FRESH USER DATA FROM DATABASE
    // =====================================================

    const result = await pool.query(
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
      [req.user.id]
    );

    // =====================================================
    // USER NOT FOUND
    // =====================================================

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    // =====================================================
    // CHECK CURRENT ACCOUNT STATUS
    // =====================================================

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "User account is disabled",
      });
    }

    // =====================================================
    // RETURN CURRENT USER
    // =====================================================

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get current user",
    });
  }
};

// =========================================================
// LOGOUT
// POST /api/auth/logout
// =========================================================

const logout = async (req, res) => {
  try {
    res.clearCookie(
      "accessToken",
      getCookieOptions()
    );

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });

  } catch (error) {
    console.error(
      "Logout error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
};