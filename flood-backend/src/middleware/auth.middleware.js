
const jwt = require("jsonwebtoken");

// =========================================================
// AUTHENTICATE USER
// =========================================================
// Verifies the JWT stored in the HTTP-only cookie.
// If valid, decoded user information is attached to req.user.
// =========================================================

const authenticate = (req, res, next) => {
  try {
    // -------------------------------------------------------
    // GET ACCESS TOKEN
    // -------------------------------------------------------

    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // -------------------------------------------------------
    // VERIFY JWT
    // -------------------------------------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // -------------------------------------------------------
    // ATTACH AUTHENTICATED USER
    // -------------------------------------------------------

    req.user = decoded;

    // -------------------------------------------------------
    // CONTINUE
    // -------------------------------------------------------

    next();

  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};


// =========================================================
// REQUIRE ADMIN
// =========================================================
// Allows only users whose JWT role is "admin".
// =========================================================

const requireAdmin = (req, res, next) => {

  // -------------------------------------------------------
  // USER MUST BE AUTHENTICATED FIRST
  // -------------------------------------------------------

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // -------------------------------------------------------
  // CHECK ADMIN ROLE
  // -------------------------------------------------------

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Administrator privileges required.",
    });
  }

  // -------------------------------------------------------
  // USER IS ADMIN
  // -------------------------------------------------------

  next();
};


// =========================================================
// GENERIC ROLE AUTHORIZATION
// =========================================================
// Useful later if you want:
// authorize("admin")
// authorize("admin", "common_user")
// =========================================================

const authorize = (...allowedRoles) => {
  return (req, res, next) => {

    // -------------------------------------------------------
    // AUTHENTICATION CHECK
    // -------------------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // -------------------------------------------------------
    // ROLE CHECK
    // -------------------------------------------------------

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {
  authenticate,
  requireAdmin,
  authorize,
};

