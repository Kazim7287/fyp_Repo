const express = require("express");

const {
  authenticate,
  requireAdmin,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  requireAdmin,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to the admin dashboard",
      user: req.user,
    });
  }
);

module.exports = router;