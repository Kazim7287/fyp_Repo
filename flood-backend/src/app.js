const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const pool = require("./config/db");

// Routes
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// =========================================================
// CORS
// =========================================================
 
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
 "http://16.171.225.118",
"http://floodforecast.duckdns.org",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin
      // Example: curl, Postman, server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Production frontend URL
      if (
        process.env.FRONTEND_URL &&
        origin === process.env.FRONTEND_URL
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },

    credentials: true,
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
      error: error.message,
    });
  }
});

// =========================================================
// AUTH ROUTES
// =========================================================

app.use("/api/auth", authRoutes);

// =========================================================
// USER ROUTES
// =========================================================

app.use("/api/users", usersRoutes);

// =========================================================
// ADMIN ROUTES
// =========================================================

app.use("/api/admin", adminRoutes);

// =========================================================
// 404 HANDLER
// =========================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================

app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// =========================================================
// EXPORT APP
// =========================================================

module.exports = app;
