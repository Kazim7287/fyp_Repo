const express = require("express");

const {
  authenticate,
  authorize,
} = require("../middleware/auth.middleware");

const sensorController = require("../controllers/sensor.controller");

const router = express.Router();

// =========================================================
// CREATE SENSOR DATA
// =========================================================

router.post(
  "/",
  authenticate,
  authorize("admin", "operator"),
  sensorController.createSensorData
);

// =========================================================
// EXPORT
// =========================================================

module.exports = router;