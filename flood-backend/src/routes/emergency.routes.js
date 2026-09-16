const express = require("express");


// =========================================================
// CONTROLLER
// =========================================================

const {
  getEmergencyInformation,
  getEmergencyInformationById,
  createEmergencyInformation,
  updateEmergencyInformation,
  deleteEmergencyInformation,
} = require("../controllers/emergency.controller");


// =========================================================
// AUTHENTICATION / AUTHORIZATION
// =========================================================

const {
  authenticate,
  requireAdmin,
} = require("../middleware/auth.middleware");


// =========================================================
// ROUTER
// =========================================================

const router = express.Router();


// =========================================================
// PUBLIC ROUTES
// =========================================================

// ---------------------------------------------------------
// GET ALL EMERGENCY INFORMATION
// ---------------------------------------------------------
//
// GET /api/emergency-information
//
// Optional filters:
//
// ?node_id=2
// ?status=WATCH
// ?active_emergency=true
//
// ---------------------------------------------------------

router.get(
  "/",
  getEmergencyInformation
);


// ---------------------------------------------------------
// GET SINGLE EMERGENCY INFORMATION
// ---------------------------------------------------------
//
// GET /api/emergency-information/:id
//
// ---------------------------------------------------------

router.get(
  "/:id",
  getEmergencyInformationById
);


// =========================================================
// ADMIN ROUTES
// =========================================================


// ---------------------------------------------------------
// CREATE EMERGENCY INFORMATION
// ---------------------------------------------------------
//
// POST /api/emergency-information
//
// Authentication:
// 1. authenticate
// 2. requireAdmin
//
// ---------------------------------------------------------

router.post(
  "/",
  authenticate,
  requireAdmin,
  createEmergencyInformation
);


// ---------------------------------------------------------
// UPDATE EMERGENCY INFORMATION
// ---------------------------------------------------------
//
// PUT /api/emergency-information/:id
//
// Authentication:
// 1. authenticate
// 2. requireAdmin
//
// ---------------------------------------------------------

router.put(
  "/:id",
  authenticate,
  requireAdmin,
  updateEmergencyInformation
);


// ---------------------------------------------------------
// DELETE EMERGENCY INFORMATION
// ---------------------------------------------------------
//
// DELETE /api/emergency-information/:id
//
// Authentication:
// 1. authenticate
// 2. requireAdmin
//
// ---------------------------------------------------------

router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  deleteEmergencyInformation
);


// =========================================================
// EXPORT
// =========================================================

module.exports = router;