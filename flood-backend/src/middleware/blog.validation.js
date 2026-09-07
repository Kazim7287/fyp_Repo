// =========================================================
// BLOG VALIDATION MIDDLEWARE
// =========================================================
//
// Validates blog data before it reaches the controller.
//
// Used for:
// POST /api/blogs
// PUT  /api/blogs/:id
//
// =========================================================


// =========================================================
// CONSTANTS
// =========================================================

const ALLOWED_STATUS = [
  "Draft",
  "Published",
];

const ALLOWED_CATEGORIES = [
  "Flood Awareness",
  "Technology",
  "Research",
  "Safety",
];

const MAX_TITLE_LENGTH = 255;
const MAX_EXCERPT_LENGTH = 300;


// =========================================================
// HELPER
// =========================================================

const isNonEmptyString = (value) => {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
};


// =========================================================
// CREATE BLOG VALIDATION
// =========================================================

const validateCreateBlog = (req, res, next) => {
  try {
    const {
      title,
      category,
      status,
      featured,
      excerpt,
      content,
    } = req.body;

    // -----------------------------------------------------
    // TITLE
    // -----------------------------------------------------

    if (!isNonEmptyString(title)) {
      return res.status(400).json({
        success: false,
        message: "Blog title is required.",
      });
    }

    if (title.trim().length > MAX_TITLE_LENGTH) {
      return res.status(400).json({
        success: false,
        message:
          `Blog title cannot exceed ${MAX_TITLE_LENGTH} characters.`,
      });
    }

    // -----------------------------------------------------
    // CATEGORY
    // -----------------------------------------------------

    if (!isNonEmptyString(category)) {
      return res.status(400).json({
        success: false,
        message: "Blog category is required.",
      });
    }

    if (!ALLOWED_CATEGORIES.includes(category.trim())) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid blog category.",
        allowedCategories:
          ALLOWED_CATEGORIES,
      });
    }

    // -----------------------------------------------------
    // STATUS
    // -----------------------------------------------------

    if (
      status !== undefined &&
      !ALLOWED_STATUS.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog status.",
        allowedStatuses:
          ALLOWED_STATUS,
      });
    }

    // -----------------------------------------------------
    // FEATURED
    // -----------------------------------------------------

    if (
      featured !== undefined &&
      typeof featured !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Featured must be a boolean value.",
      });
    }

    // -----------------------------------------------------
    // EXCERPT
    // -----------------------------------------------------

    if (!isNonEmptyString(excerpt)) {
      return res.status(400).json({
        success: false,
        message: "Blog excerpt is required.",
      });
    }

    if (
      excerpt.trim().length >
      MAX_EXCERPT_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Blog excerpt cannot exceed ${MAX_EXCERPT_LENGTH} characters.`,
      });
    }

    // -----------------------------------------------------
    // CONTENT
    // -----------------------------------------------------

    if (!isNonEmptyString(content)) {
      return res.status(400).json({
        success: false,
        message: "Blog content is required.",
      });
    }

    // -----------------------------------------------------
    // CLEAN VALUES
    // -----------------------------------------------------

    req.body.title = title.trim();
    req.body.category = category.trim();
    req.body.excerpt = excerpt.trim();
    req.body.content = content.trim();

    // -----------------------------------------------------
    // DEFAULT STATUS
    // -----------------------------------------------------

    if (status === undefined) {
      req.body.status = "Draft";
    }

    // -----------------------------------------------------
    // DEFAULT FEATURED
    // -----------------------------------------------------

    if (featured === undefined) {
      req.body.featured = false;
    }

    next();

  } catch (error) {
    console.error(
      "Blog validation error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        "Invalid blog data.",
    });
  }
};


// =========================================================
// UPDATE BLOG VALIDATION
// =========================================================

const validateUpdateBlog = (req, res, next) => {
  try {
    const {
      title,
      category,
      status,
      featured,
      excerpt,
      content,
    } = req.body;

    // -----------------------------------------------------
    // TITLE
    // -----------------------------------------------------

    if (
      title !== undefined
    ) {
      if (!isNonEmptyString(title)) {
        return res.status(400).json({
          success: false,
          message:
            "Blog title cannot be empty.",
        });
      }

      if (
        title.trim().length >
        MAX_TITLE_LENGTH
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Blog title cannot exceed ${MAX_TITLE_LENGTH} characters.`,
        });
      }

      req.body.title =
        title.trim();
    }

    // -----------------------------------------------------
    // CATEGORY
    // -----------------------------------------------------

    if (
      category !== undefined
    ) {
      if (!isNonEmptyString(category)) {
        return res.status(400).json({
          success: false,
          message:
            "Blog category cannot be empty.",
        });
      }

      if (
        !ALLOWED_CATEGORIES.includes(
          category.trim()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid blog category.",
          allowedCategories:
            ALLOWED_CATEGORIES,
        });
      }

      req.body.category =
        category.trim();
    }

    // -----------------------------------------------------
    // STATUS
    // -----------------------------------------------------

    if (
      status !== undefined &&
      !ALLOWED_STATUS.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid blog status.",
        allowedStatuses:
          ALLOWED_STATUS,
      });
    }

    // -----------------------------------------------------
    // FEATURED
    // -----------------------------------------------------

    if (
      featured !== undefined &&
      typeof featured !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Featured must be a boolean value.",
      });
    }

    // -----------------------------------------------------
    // EXCERPT
    // -----------------------------------------------------

    if (
      excerpt !== undefined
    ) {
      if (!isNonEmptyString(excerpt)) {
        return res.status(400).json({
          success: false,
          message:
            "Blog excerpt cannot be empty.",
        });
      }

      if (
        excerpt.trim().length >
        MAX_EXCERPT_LENGTH
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Blog excerpt cannot exceed ${MAX_EXCERPT_LENGTH} characters.`,
        });
      }

      req.body.excerpt =
        excerpt.trim();
    }

    // -----------------------------------------------------
    // CONTENT
    // -----------------------------------------------------

    if (
      content !== undefined
    ) {
      if (!isNonEmptyString(content)) {
        return res.status(400).json({
          success: false,
          message:
            "Blog content cannot be empty.",
        });
      }

      req.body.content =
        content.trim();
    }

    next();

  } catch (error) {
    console.error(
      "Blog update validation error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        "Invalid blog data.",
    });
  }
};


// =========================================================
// BLOG ID VALIDATION
// =========================================================

const validateBlogId = (req, res, next) => {
  const { id } = req.params;

  // BIGSERIAL produces numeric IDs.
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID.",
    });
  }

  req.params.id =
    Number(id);

  next();
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {
  validateCreateBlog,
  validateUpdateBlog,
  validateBlogId,
};