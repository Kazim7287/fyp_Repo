
const express = require("express");

const {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  updateNewsStatus,
  updateNewsFeatured,
  getNewsStats,
} = require("../controllers/news.controller");

const {
  authenticate,
  requireAdmin,
} = require("../middleware/auth.middleware");

const router = express.Router();

// =========================================================
// PUBLIC ROUTES
// =========================================================

// Get all news
router.get("/", getNews);

// IMPORTANT:
// /stats MUST come before /:id
router.get(
  "/stats",
  authenticate,
  requireAdmin,
  getNewsStats
);

// Get single news article
router.get(
  "/:id",
  getNewsById
);

// =========================================================
// ADMIN ROUTES
// =========================================================

// Create news
router.post(
  "/",
  authenticate,
  requireAdmin,
  createNews
);

// Update news
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  updateNews
);

// Delete news
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  deleteNews
);

// Publish / move to draft
router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  updateNewsStatus
);

// Mark / unmark as featured
router.patch(
  "/:id/featured",
  authenticate,
  requireAdmin,
  updateNewsFeatured
);

module.exports = router;
