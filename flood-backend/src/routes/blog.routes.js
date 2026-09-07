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
router.post("/", createBlog);

// PUT /api/blogs/:id
router.put("/:id", updateBlog);

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