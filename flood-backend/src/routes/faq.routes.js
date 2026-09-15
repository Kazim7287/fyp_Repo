const express = require("express");

const {
  getFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  updateFAQStatus,
  updateFAQFeatured,
  getFAQStats,
} = require("../controllers/faq.controller");

const {
  validateFAQId,
  validateCreateFAQ,
  validateUpdateFAQ,
  validateFAQStatus,
  validateFAQFeatured,
} = require("../middleware/faq.middleware");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

// =========================================================
// FAQ STATISTICS
// GET /api/faqs/stats
// =========================================================

router.get(
  "/stats",
  authenticate,
  getFAQStats
);

// =========================================================
// GET ALL FAQs
// GET /api/faqs
// =========================================================

router.get(
  "/",
  authenticate,
  getFAQs
);

// =========================================================
// CREATE FAQ
// POST /api/faqs
// =========================================================

router.post(
  "/",
  authenticate,
  validateCreateFAQ,
  createFAQ
);

// =========================================================
// UPDATE FAQ STATUS
// PATCH /api/faqs/:id/status
// =========================================================

router.patch(
  "/:id/status",
  authenticate,
  validateFAQId,
  validateFAQStatus,
  updateFAQStatus
);

// =========================================================
// UPDATE FAQ FEATURED
// PATCH /api/faqs/:id/featured
// =========================================================

router.patch(
  "/:id/featured",
  authenticate,
  validateFAQId,
  validateFAQFeatured,
  updateFAQFeatured
);

// =========================================================
// GET SINGLE FAQ
// GET /api/faqs/:id
// =========================================================

router.get(
  "/:id",
  authenticate,
  validateFAQId,
  getFAQ
);

// =========================================================
// UPDATE FAQ
// PUT /api/faqs/:id
// =========================================================

router.put(
  "/:id",
  authenticate,
  validateFAQId,
  validateUpdateFAQ,
  updateFAQ
);

// =========================================================
// DELETE FAQ
// DELETE /api/faqs/:id
// =========================================================

router.delete(
  "/:id",
  authenticate,
  validateFAQId,
  deleteFAQ
);

module.exports = router;