
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
  uploadBlogContentImage,
} = require("../controllers/blog.controller");

const {
  uploadBlogImage,
  uploadBlogContentImage: uploadContentImage,
} = require("../middleware/upload.middleware");

const router = express.Router();

// =========================================================
// GET ALL BLOGS
// =========================================================

router.get("/", getBlogs);

// =========================================================
// GET BLOG STATS
// =========================================================

router.get("/stats", getBlogStats);

// =========================================================
// UPLOAD CONTENT IMAGE
// =========================================================
// Used by ReactQuill.
//
// This is different from the featured image.
// Every image inserted into the editor can be uploaded here.
// =========================================================

router.post(
  "/upload-image",
  uploadContentImage.single("contentImage"),
  uploadBlogContentImage
);

// =========================================================
// GET SINGLE BLOG
// =========================================================

router.get("/:id", getBlog);

// =========================================================
// CREATE BLOG
// =========================================================

router.post(
  "/",
  uploadBlogImage.single("image"),
  createBlog
);

// =========================================================
// UPDATE BLOG
// =========================================================

router.put(
  "/:id",
  uploadBlogImage.single("image"),
  updateBlog
);

// =========================================================
// DELETE BLOG
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
