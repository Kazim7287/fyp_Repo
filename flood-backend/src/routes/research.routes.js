const express = require("express");

const {
  getResearch,
  getResearchById,
  createResearch,
  uploadResearchPdf,
  updateResearch,
  deleteResearch,
  toggleResearchStatus,
  getResearchStats,
} = require("../controllers/research.controller");

const {
  uploadResearchImage,
  uploadResearchPdf: uploadPdf,
} = require("../middleware/upload.middleware");

const router = express.Router();

// =========================================================
// RESEARCH STATISTICS
// GET /api/research/stats
// =========================================================

router.get(
  "/stats",
  getResearchStats
);

// =========================================================
// GET ALL RESEARCH
// GET /api/research
// =========================================================

router.get(
  "/",
  getResearch
);

// =========================================================
// GET SINGLE RESEARCH
// GET /api/research/:id
// =========================================================

router.get(
  "/:id",
  getResearchById
);

// =========================================================
// CREATE RESEARCH
// POST /api/research
// =========================================================

router.post(
  "/",
  uploadResearchImage,
  createResearch
);

// =========================================================
// UPDATE RESEARCH
// PUT /api/research/:id
// =========================================================

router.put(
  "/:id",
  uploadResearchImage,
  updateResearch
);

// =========================================================
// UPLOAD RESEARCH PDF
// POST /api/research/:id/pdf
// =========================================================

router.post(
  "/:id/pdf",
  uploadPdf,
  uploadResearchPdf
);

// =========================================================
// TOGGLE PUBLISH / DRAFT
// PATCH /api/research/:id/toggle-status
// =========================================================

router.patch(
  "/:id/toggle-status",
  toggleResearchStatus
);

// =========================================================
// DELETE RESEARCH
// DELETE /api/research/:id
// =========================================================

router.delete(
  "/:id",
  deleteResearch
);

// =========================================================
// EXPORT
// =========================================================

module.exports = router;