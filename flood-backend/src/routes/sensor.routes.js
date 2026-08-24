const express = require("express");

const authenticate =
  require("../middleware/authenticate");

const authorize =
  require("../middleware/authorize");

const sensorController =
  require("../controllers/sensor.controller");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("admin", "operator"),
  sensorController.createSensorData
);

module.exports = router;