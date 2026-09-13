
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

router.get("/", getAnnouncements);

// IMPORTANT:
// /stats MUST come before /:id
router.get(
  "/stats",
  authenticate,
  requireAdmin,
  getAnnouncementStats
);

router.get("/:id", getAnnouncement);

// =========================================================
// ADMIN ROUTES
// =========================================================

router.post(
  "/",
  authenticate,
  requireAdmin,
  createAnnouncement
);

router.put(
  "/:id",
  authenticate,
  requireAdmin,
  updateAnnouncement
);

router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  deleteAnnouncement
);

router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  updateAnnouncementStatus
);

module.exports = router;
