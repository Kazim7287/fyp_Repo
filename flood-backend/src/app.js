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

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
|
| Development:
|   Allows any localhost port:
|   http://localhost:5173
|   http://localhost:5174
|   http://localhost:5175
|   etc.
|
| Production:
|   Only allows FRONTEND_URL from .env
|
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // Examples:
      // - PowerShell
      // - Postman
      // - Server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      // Development
      if (
        process.env.NODE_ENV !== "production" &&
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }

      // Production
      if (
        process.env.NODE_ENV === "production" &&
        origin === process.env.FRONTEND_URL
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },

    // Required for HttpOnly authentication cookies
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/*
|--------------------------------------------------------------------------
| Cookie Parser
|--------------------------------------------------------------------------
*/

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Flood Forecasting API is running",
  });
});

/*
|--------------------------------------------------------------------------
| PostgreSQL Test
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
|
| POST /api/auth/login
| POST /api/auth/logout
|
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| User Routes
|--------------------------------------------------------------------------
|
| /api/users/...
|
|--------------------------------------------------------------------------
*/

app.use("/api/users", usersRoutes);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| GET /api/admin/dashboard
|
|--------------------------------------------------------------------------
*/

app.use("/api/admin", adminRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.message || "Internal server error",
  });
});

/*
|--------------------------------------------------------------------------
| Export App
|--------------------------------------------------------------------------
*/

module.exports = app;