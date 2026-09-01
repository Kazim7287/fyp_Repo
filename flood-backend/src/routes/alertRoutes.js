
const express = require("express");

const router = express.Router();

const {
  getAlerts,
  getAlertById,
  createManualAlert,
  acknowledgeAlert,
  resolveAlert,
} = require("../controllers/alertController");

const {
  authenticate,
} = require("../middleware/auth.middleware");

// =========================================================
// GET ALL ALERTS
// GET /api/alerts
// =========================================================
//
// Any authenticated user can view alerts.
//

router.get(
  "/",
  authenticate,
  getAlerts
);

// =========================================================
// GET SINGLE ALERT
// GET /api/alerts/:id
// =========================================================
//
// Any authenticated user can view an alert.
//

router.get(
  "/:id",
  authenticate,
  getAlertById
);

// =========================================================
// CREATE MANUAL ALERT
// POST /api/alerts
// =========================================================
//
// Authentication required.
//
// The controller will use:
//
// req.user.id
//
// as the creator of the manual alert.
//

router.post(
  "/",
  authenticate,
  createManualAlert
);

// =========================================================
// ACKNOWLEDGE ALERT
// PATCH /api/alerts/:id/acknowledge
// =========================================================

router.patch(
  "/:id/acknowledge",
  authenticate,
  acknowledgeAlert
);

// =========================================================
// RESOLVE ALERT
// PATCH /api/alerts/:id/resolve
// =========================================================

router.patch(
  "/:id/resolve",
  authenticate,
  resolveAlert
);

// =========================================================
// EXPORT ROUTER
// =========================================================

module.exports = router;
