
const express = require("express");

const {
  exportEnvironmentalJSON,
  exportEnvironmentalExcel,
  exportEnvironmentalPDF,
} = require("../controllers/environmentalExport.controller");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Environmental Data Export Routes
|--------------------------------------------------------------------------
*/

// JSON export
router.get("/json", exportEnvironmentalJSON);

// Excel export
router.get("/excel", exportEnvironmentalExcel);

// PDF export
router.get("/pdf", exportEnvironmentalPDF);

module.exports = router;
