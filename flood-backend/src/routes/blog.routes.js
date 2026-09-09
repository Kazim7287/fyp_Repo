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

const upload = require("../middleware/blogUpload");

const router = express.Router();

// =========================================================
// BLOG ROUTES
// =========================================================

// GET /api/blogs
router.get("/", getBlogs);

// GET /api/blogs/stats
router.get("/stats", getBlogStats);

// GET /api/blogs/:id
router.get("/:id", getBlog);

// POST /api/blogs
// Supports multipart/form-data + optional image
router.post(
  "/",
  upload.single("image"),
  createBlog
);

// PUT /api/blogs/:id
// Supports multipart/form-data + optional image
router.put(
  "/:id",
  upload.single("image"),
  updateBlog
);

// DELETE /api/blogs/:id
router.delete("/:id", deleteBlog);

// PATCH /api/blogs/:id/toggle-publish
router.patch(
  "/:id/toggle-publish",
  togglePublish
);

// PATCH /api/blogs/:id/views
router.patch(
  "/:id/views",
  incrementViews
);

module.exports = router;