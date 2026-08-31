
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// =========================================================
// ROUTES
// =========================================================

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const usersRoutes = require("./routes/users.routes");
const sensorRoutes = require("./routes/sensor.routes");
const adminRoutes = require("./routes/admin.routes");
const componentRoutes = require("./routes/component.routes");

// =========================================================
// APP
// =========================================================

const app = express();

// =========================================================
// SECURITY
// =========================================================

app.use(helmet());

// =========================================================
// CORS
// =========================================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as curl, Postman, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(`❌ CORS blocked origin: ${origin}`);

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
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
    ],
  })
);

// =========================================================
// BODY PARSING
// =========================================================

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// =========================================================
// COOKIES
// =========================================================

app.use(cookieParser());

// =========================================================
// RATE LIMITING
// =========================================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

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

app.get("/db-test", async (req, res, next) => {
  try {
    const pool = require("./config/db");

    const result = await pool.query(
      "SELECT NOW() AS current_time"
    );

    res.status(200).json({
      success: true,
      message: "PostgreSQL connection successful",
      databaseTime: result.rows[0].current_time,
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================
// API ROUTES
// =========================================================

// Authentication
app.use("/api/auth", authRoutes);

// Users
app.use("/api/user", userRoutes);

app.use("/api/users", usersRoutes);

// Sensors
app.use("/api/sensors", sensorRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// IoT Component Library
app.use("/api/components", componentRoutes);

// =========================================================
// 404 NOT FOUND
// IMPORTANT:
// This MUST come AFTER all routes.
// =========================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// =========================================================
// GLOBAL ERROR HANDLER
// IMPORTANT:
// This MUST be the LAST middleware.
// =========================================================

app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);

  // CORS error
  if (err.message && err.message.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// =========================================================
// EXPORT APP
// =========================================================

module.exports = app;
