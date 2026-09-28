const express = require("express");

const {
  getSensorData,
} = require("../controllers/sensorController");

const router = express.Router();

// ============================================================
// GET SENSOR DATA
// ============================================================

router.get("/data", getSensorData);

module.exports = router;