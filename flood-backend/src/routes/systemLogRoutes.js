const express = require("express");

const {
  getSystemLogs,
} = require("../controllers/systemLogController");

const router = express.Router();

// GET /api/system-logs
router.get("/", getSystemLogs);

module.exports = router;