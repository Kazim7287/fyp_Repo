const express = require("express");

const {
  authenticate,
  authorize,
} = require("../middleware/auth.middleware");

const componentController = require("../controllers/component.controller");

const router = express.Router();

// Get all components
router.get(
  "/",
  authenticate,
  componentController.getComponents
);

// Add component
router.post(
  "/",
  authenticate,
  authorize("admin"),
  componentController.createComponent
);

// Update component
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  componentController.updateComponent
);

// Delete component
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  componentController.deleteComponent
);

module.exports = router;