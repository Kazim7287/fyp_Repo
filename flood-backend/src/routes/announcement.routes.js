const express = require("express");

const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  updateAnnouncementStatus,
  getAnnouncementStats,
} = require("../controllers/announcement.controller");

const {
  authenticate,
  requireAdmin,
} = require("../middleware/auth.middleware");

const router = express.Router();

// =========================================================
// PUBLIC ROUTES
// =========================================================

// Get all announcements
router.get("/", getAnnouncements);

// Get single announcement
router.get("/:id", getAnnouncement);

// =========================================================
// ADMIN ROUTES
// =========================================================

// Announcement statistics
router.get(
  "/stats",
  authenticate,
  requireAdmin,
  getAnnouncementStats
);

// Create announcement
router.post(
  "/",
  authenticate,
  requireAdmin,
  createAnnouncement
);

// Update announcement
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  updateAnnouncement
);

// Delete announcement
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  deleteAnnouncement
);

// Change announcement status
router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  updateAnnouncementStatus
);

module.exports = router;