const { body, param, validationResult } = require("express-validator");

// =========================================================
// VALIDATION RESULT HANDLER
// =========================================================

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

// =========================================================
// FAQ ID VALIDATION
// =========================================================

const validateFAQId = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("FAQ ID is required.")
    .isInt({ min: 1 })
    .withMessage("FAQ ID must be a positive integer."),

  handleValidationErrors,
];

// =========================================================
// CREATE FAQ VALIDATION
// =========================================================

const validateCreateFAQ = [
  body("question")
    .trim()
    .notEmpty()
    .withMessage("Question is required.")
    .isLength({ max: 300 })
    .withMessage("Question cannot exceed 300 characters."),

  body("answer")
    .trim()
    .notEmpty()
    .withMessage("Answer is required.")
    .isLength({ max: 3000 })
    .withMessage("Answer cannot exceed 3000 characters."),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required.")
    .isLength({ max: 100 })
    .withMessage("Category cannot exceed 100 characters."),

  body("status")
    .optional()
    .isIn(["Draft", "Published"])
    .withMessage(
      "Status must be either Draft or Published."
    ),

  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean."),

  body("display_order")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "Display order must be a positive integer."
    ),

  handleValidationErrors,
];

// =========================================================
// UPDATE FAQ VALIDATION
// =========================================================

const validateUpdateFAQ = [
  body("question")
    .trim()
    .notEmpty()
    .withMessage("Question is required.")
    .isLength({ max: 300 })
    .withMessage("Question cannot exceed 300 characters."),

  body("answer")
    .trim()
    .notEmpty()
    .withMessage("Answer is required.")
    .isLength({ max: 3000 })
    .withMessage("Answer cannot exceed 3000 characters."),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required.")
    .isLength({ max: 100 })
    .withMessage("Category cannot exceed 100 characters."),

  body("status")
    .isIn(["Draft", "Published"])
    .withMessage(
      "Status must be either Draft or Published."
    ),

  body("featured")
    .isBoolean()
    .withMessage("Featured must be a boolean."),

  body("display_order")
    .isInt({ min: 1 })
    .withMessage(
      "Display order must be a positive integer."
    ),

  handleValidationErrors,
];

// =========================================================
// STATUS VALIDATION
// =========================================================

const validateFAQStatus = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(["Draft", "Published"])
    .withMessage(
      "Status must be either Draft or Published."
    ),

  handleValidationErrors,
];

// =========================================================
// FEATURED VALIDATION
// =========================================================

const validateFAQFeatured = [
  body("featured")
    .notEmpty()
    .withMessage("Featured value is required.")
    .isBoolean()
    .withMessage("Featured must be a boolean."),

  handleValidationErrors,
];

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  handleValidationErrors,
  validateFAQId,
  validateCreateFAQ,
  validateUpdateFAQ,
  validateFAQStatus,
  validateFAQFeatured,
};