const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

require("dotenv").config();

const pool = require("./config/db");

// =========================================================
// ROUTES
// =========================================================

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const adminRoutes = require("./routes/admin.routes");
const sensorRoutes = require("./routes/sensor.routes");
const componentRoutes = require("./routes/component.routes");
const nodeRoutes = require("./routes/nodeRoutes");

// ---------------------------------------------------------
// ALERT ROUTES
// ---------------------------------------------------------

const alertRoutes = require("./routes/alertRoutes");

// ---------------------------------------------------------
// BLOG ROUTES
// ---------------------------------------------------------

const blogRoutes = require("./routes/blog.routes");

// ---------------------------------------------------------
// RESEARCH ROUTES
// ---------------------------------------------------------

const researchRoutes = require("./routes/research.routes");

const app = express();

// =========================================================
// CORS CONFIGURATION
// =========================================================

const allowedOrigins = [
  // -------------------------------------------------------
  // Local development
  // -------------------------------------------------------

  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",

  // -------------------------------------------------------
  // Production frontend
  // -------------------------------------------------------

  "http://16.171.225.118",
  "http://13.61.106.220",
  "http://floodforecast.duckdns.org",
];

// ---------------------------------------------------------
// Add FRONTEND_URL from .env
// ---------------------------------------------------------

if (process.env.FRONTEND_URL) {
  const frontendUrl = process.env.FRONTEND_URL.trim();

  if (
    frontendUrl &&
    !allowedOrigins.includes(frontendUrl)
  ) {
    allowedOrigins.push(frontendUrl);
  }
}

// =========================================================
// CORS MIDDLEWARE
// =========================================================

app.use(
  cors({
    origin: (origin, callback) => {
      // ---------------------------------------------------
      // Requests without Origin
      // curl, Postman, server-to-server, etc.
      // ---------------------------------------------------

      if (!origin) {
        return callback(null, true);
      }

      // ---------------------------------------------------
      // Allowed origin
      // ---------------------------------------------------

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ---------------------------------------------------
      // Block unknown origin
      // ---------------------------------------------------

      console.error(
        `❌ CORS blocked origin: ${origin}`
      );

      return callback(
        new Error(
          `CORS blocked origin: ${origin}`
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
  })
);

// =========================================================
// BODY PARSERS
// =========================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =========================================================
// COOKIE PARSER
// =========================================================

app.use(cookieParser());

// =========================================================
// STATIC UPLOADS
// =========================================================
//
// Makes uploaded files available through:
//
// /uploads/blogs/...
// /uploads/research/images/...
// /uploads/research/pdfs/...
//
// =========================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "..", "uploads")
  )
);

// =========================================================
// HEALTH CHECK
// =========================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Flood Forecasting API is running",
  });
});

// =========================================================
// DATABASE TEST
// =========================================================

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS current_time"
    );

    res.status(200).json({
      success: true,
      message: "PostgreSQL connected successfully",
      time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error(
      "❌ Database test failed:",
      error
    );

    res.status(500).json({
      success: false,
      message: "PostgreSQL connection failed",

      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message,
    });
  }
});

// =========================================================
// AUTH ROUTES
// =========================================================
//
// POST   /api/auth/login
// POST   /api/auth/register
// etc.
//
// =========================================================

app.use(
  "/api/auth",
  authRoutes
);

// =========================================================
// USER ROUTES
// =========================================================
//
// GET    /api/users
// GET    /api/users/:id
// etc.
//
// =========================================================

app.use(
  "/api/users",
  usersRoutes
);

// =========================================================
// ADMIN ROUTES
// =========================================================
//
// Admin-related endpoints
//
// =========================================================

app.use(
  "/api/admin",
  adminRoutes
);

// =========================================================
// SENSOR ROUTES
// =========================================================
//
// Sensor-related endpoints
//
// =========================================================

app.use(
  "/api/sensors",
  sensorRoutes
);

// =========================================================
// COMPONENT LIBRARY ROUTES
// =========================================================
//
// Component management endpoints
//
// =========================================================

app.use(
  "/api/components",
  componentRoutes
);

// =========================================================
// NODE / IOT INFRASTRUCTURE ROUTES
// =========================================================
//
// IoT node management endpoints
//
// =========================================================

app.use(
  "/api/nodes",
  nodeRoutes
);

// =========================================================
// ALERT MANAGEMENT ROUTES
// =========================================================
//
// GET    /api/alerts
// GET    /api/alerts/:id
// POST   /api/alerts
// PATCH  /api/alerts/:id/acknowledge
// PATCH  /api/alerts/:id/resolve
//
// =========================================================

app.use(
  "/api/alerts",
  alertRoutes
);

// =========================================================
// BLOG MANAGEMENT ROUTES
// =========================================================
//
// GET    /api/blogs
// GET    /api/blogs/stats
// GET    /api/blogs/:id
// POST   /api/blogs
// PUT    /api/blogs/:id
// DELETE /api/blogs/:id
// PATCH  /api/blogs/:id/toggle-publish
// PATCH  /api/blogs/:id/views
//
// =========================================================

app.use(
  "/api/blogs",
  blogRoutes
);

// =========================================================
// RESEARCH MANAGEMENT ROUTES
// =========================================================
//
// GET    /api/research
// GET    /api/research/stats
// GET    /api/research/:id
// POST   /api/research
// PUT    /api/research/:id
// POST   /api/research/:id/pdf
// PATCH  /api/research/:id/toggle-status
// DELETE /api/research/:id
//
// =========================================================

app.use(
  "/api/research",
  researchRoutes
);

// =========================================================
// 404 HANDLER
// =========================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,

    message:
      `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "❌ Server error:",
      err
    );

    // -----------------------------------------------------
    // CORS errors
    // -----------------------------------------------------

    if (
      err.message?.startsWith(
        "CORS blocked origin"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: err.message,
      });
    }

    // -----------------------------------------------------
    // General errors
    // -----------------------------------------------------

    const statusCode =
      err.status ||
      err.statusCode ||
      500;

    return res.status(statusCode).json({
      success: false,

      message:
        err.message ||
        "Internal server error",

      // Do not expose internal errors in production
      ...(process.env.NODE_ENV !== "production" && {
        stack: err.stack,
      }),
    });
  }
);

// =========================================================
// EXPORT APP
// =========================================================

module.exports = app;