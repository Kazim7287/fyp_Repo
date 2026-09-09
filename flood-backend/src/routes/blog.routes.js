const express = require("express");

const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublish,
  incrementViews,
  getBlogStats,
} = require("../controllers/blog.controller");

const upload = require("../middleware/upload.middleware");

const router = express.Router();

// =========================================================
// GET
// =========================================================

router.get("/", getBlogs);

router.get("/stats", getBlogStats);

router.get("/:id", getBlog);

// =========================================================
// CREATE BLOG
// =========================================================

router.post(
  "/",
  upload.single("image"),
  createBlog
);

// =========================================================
// UPDATE BLOG
// =========================================================

router.put(
  "/:id",
  upload.single("image"),
  updateBlog
);

// =========================================================
// DELETE
// =========================================================

router.delete(
  "/:id",
  deleteBlog
);

// =========================================================
// TOGGLE PUBLISH
// =========================================================

router.patch(
  "/:id/toggle-publish",
  togglePublish
);

// =========================================================
// INCREMENT VIEWS
// =========================================================

router.patch(
  "/:id/views",
  incrementViews
);

module.exports = router;