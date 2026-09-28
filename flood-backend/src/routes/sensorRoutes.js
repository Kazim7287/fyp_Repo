
const express = require("express");

const {
  authenticate,
  authorize,
} = require("../middleware/auth.middleware");

// Existing sensor controller
const sensorController = require("../controllers/sensor.controller");

// Tolthawk sensor controller
const {
  getSensorData,
  getRiverLevelData,
} = require("../controllers/sensorController");

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
// GET TOLTHAWK SENSOR DATA
// =========================================================

router.get(
  "/data",
  getSensorData
);

// =========================================================
// GET RIVER LEVEL DATA FROM INFLUXDB
// =========================================================

router.get(
  "/river-level",
  getRiverLevelData
);

// =========================================================
// EXPORT
// =========================================================

module.exports = router;
