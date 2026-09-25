
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

require("dotenv").config();

const pool = require("./config/db");

// =========================================================
// INFLUXDB
// =========================================================

const { influxQueryApi } = require("../influxdb");

// =========================================================
// ROUTES
// =========================================================

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const adminRoutes = require("./routes/admin.routes");
const sensorRoutes = require("./routes/sensor.routes");
const componentRoutes = require("./routes/component.routes");
const nodeRoutes = require("./routes/nodeRoutes");

// =========================================================
// ALERT ROUTES
// =========================================================

const alertRoutes = require("./routes/alertRoutes");

// =========================================================
// BLOG ROUTES
// =========================================================

const blogRoutes = require("./routes/blog.routes");

// =========================================================
// RESEARCH ROUTES
// =========================================================

const researchRoutes = require("./routes/research.routes");

// =========================================================
// ANNOUNCEMENT ROUTES
// =========================================================

const announcementRoutes = require("./routes/announcement.routes");

// =========================================================
// NEWS ROUTES
// =========================================================

const newsRoutes = require("./routes/news.routes");

// =========================================================
// FAQ ROUTES
// =========================================================

const faqRoutes = require("./routes/faq.routes");

// =========================================================
// EMERGENCY INFORMATION ROUTES
// =========================================================

const emergencyRoutes = require("./routes/emergency.routes");

// =========================================================
// ENVIRONMENTAL DATA ROUTES
// =========================================================

const environmentalRoutes = require("./routes/environmental.routes");

// =========================================================
// EXPRESS APP
// =========================================================

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
      // Postman, curl, server-to-server, etc.
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

    // -----------------------------------------------------
    // Allow HTTP-only authentication cookies
    // -----------------------------------------------------

    credentials: true,

    // -----------------------------------------------------
    // Allowed HTTP methods
    // -----------------------------------------------------

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    // -----------------------------------------------------
    // Allowed request headers
    // -----------------------------------------------------

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

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "..",
      "uploads"
    )
  )
);

// =========================================================
// HEALTH CHECK
// =========================================================

app.get(
  "/",
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Flood Forecasting API is running",
    });
  }
);

// =========================================================
// DATABASE TEST
// =========================================================

app.get(
  "/db-test",
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT NOW() AS current_time"
      );

      return res.status(200).json({
        success: true,
        message:
          "PostgreSQL connected successfully",
        time:
          result.rows[0].current_time,
      });
    } catch (error) {
      console.error(
        "❌ Database test failed:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "PostgreSQL connection failed",

        ...(process.env.NODE_ENV !==
          "production" && {
          error: error.message,
        }),
      });
    }
  }
);

// =========================================================
// INFLUXDB CONNECTION TEST
// =========================================================
//
// Temporary endpoint for testing the InfluxDB Cloud
// configuration.
//
// =========================================================

app.get(
  "/influxdb-test",
  async (req, res) => {
    try {
      if (
        !process.env.INFLUXDB_URL ||
        !process.env.INFLUXDB_TOKEN ||
        !process.env.INFLUXDB_ORG ||
        !process.env.INFLUXDB_BUCKET
      ) {
        return res.status(500).json({
          success: false,
          message:
            "InfluxDB environment variables are missing",
        });
      }

      const query =
        `from(bucket: "${process.env.INFLUXDB_BUCKET}") ` +
        `|> range(start: -1m) ` +
        `|> limit(n: 1)`;

      let foundData = false;

      await new Promise(
        (resolve, reject) => {
          influxQueryApi.queryRows(
            query,
            {
              next(row, tableMeta) {
                foundData = true;
              },

              error(error) {
                reject(error);
              },

              complete() {
                resolve();
              },
            }
          );
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "InfluxDB connection successful",
        bucket:
          process.env.INFLUXDB_BUCKET,
        organization:
          process.env.INFLUXDB_ORG,
        dataFound:
          foundData,
      });
    } catch (error) {
      console.error(
        "❌ InfluxDB test failed:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "InfluxDB connection failed",

        ...(process.env.NODE_ENV !==
          "production" && {
          error: error.message,
        }),
      });
    }
  }
);

// =========================================================
// AUTH ROUTES
// =========================================================

app.use(
  "/api/auth",
  authRoutes
);

// =========================================================
// USER ROUTES
// =========================================================

app.use(
  "/api/users",
  usersRoutes
);

// =========================================================
// ADMIN ROUTES
// =========================================================

app.use(
  "/api/admin",
  adminRoutes
);

// =========================================================
// SENSOR ROUTES
// =========================================================

app.use(
  "/api/sensors",
  sensorRoutes
);

// =========================================================
// COMPONENT LIBRARY ROUTES
// =========================================================

app.use(
  "/api/components",
  componentRoutes
);

// =========================================================
// NODE / IOT INFRASTRUCTURE ROUTES
// =========================================================

app.use(
  "/api/nodes",
  nodeRoutes
);

// =========================================================
// ALERT MANAGEMENT ROUTES
// =========================================================

app.use(
  "/api/alerts",
  alertRoutes
);

// =========================================================
// BLOG MANAGEMENT ROUTES
// =========================================================

app.use(
  "/api/blogs",
  blogRoutes
);

// =========================================================
// RESEARCH MANAGEMENT ROUTES
// =========================================================

app.use(
  "/api/research",
  researchRoutes
);

// =========================================================
// ANNOUNCEMENT MANAGEMENT ROUTES
// =========================================================

app.use(
  "/api/announcements",
  announcementRoutes
);

// =========================================================
// NEWS MANAGEMENT ROUTES
// =========================================================

app.use(
  "/api/news",
  newsRoutes
);

// =========================================================
// FAQ MANAGEMENT ROUTES
// =========================================================

app.use(
  "/api/faqs",
  faqRoutes
);

// =========================================================
// EMERGENCY INFORMATION ROUTES
// =========================================================

app.use(
  "/api/emergency-information",
  emergencyRoutes
);

// =========================================================
// ENVIRONMENTAL DATA ROUTES
// =========================================================
//
// React EnvironmentalData page will use:
//
// POST /api/environmental-data
//
// =========================================================

app.use(
  "/api/environmental-data",
  environmentalRoutes
);

// =========================================================
// 404 HANDLER
// =========================================================

app.use(
  (req, res) => {
    return res.status(404).json({
      success: false,
      message:
        `Route ${req.method} ${req.originalUrl} not found`,
    });
  }
);

// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
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

    return res.status(
      statusCode
    ).json({
      success: false,

      message:
        err.message ||
        "Internal server error",

      // ---------------------------------------------------
      // Never expose stack traces in production
      // ---------------------------------------------------

      ...(process.env.NODE_ENV !==
        "production" && {
        stack: err.stack,
      }),
    });
  }
);

// =========================================================
// EXPORT APP
// =========================================================

module.exports = app;
