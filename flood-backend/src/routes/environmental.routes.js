
const express = require("express");
const {
  saveEnvironmentalData,
} = require("../controllers/environmental.controller");

const router = express.Router();

router.post("/", saveEnvironmentalData);

module.exports = router;
