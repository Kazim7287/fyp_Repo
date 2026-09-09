const blogService = require("../services/blog.service");

// =========================================================
// HELPERS
// =========================================================

/**
 * Convert different truthy/falsy values into a real boolean.
 *
 * FormData sends values as strings, so:
 * "true"  -> true
 * "false" -> false
 * "1"     -> true
 * "0"     -> false
 */
const parseBoolean = (value) => {
  return (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  );
};

/**
 * Build the public URL for an uploaded blog image.
 *
 * Multer stores the file on disk and provides:
 * req.file.filename
 *
 * We store only the public URL in the database.
 */
const getUploadedImageUrl = (req) => {
  if (!req.file) {
    return null;
  }

  return `/uploads/blogs/${req.file.filename}`;
};


// =========================================================
// GET ALL BLOGS
// =========================================================

const getBlogs = async (req, res, next) => {
  try {
    const {
      search = "",
      status = "all",
      category = "all",
      page = 1,
      limit = 10,
    } = req.query;

    const result = await blogService.getAllBlogs({
      search,
      status,
      category,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });

    return res.status(200).json({
      success: true,
      data: result.blogs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// GET SINGLE BLOG
// =========================================================

const getBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required.",
      });
    }

    const blog = await blogService.getBlogById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// CREATE BLOG
// =========================================================

const createBlog = async (req, res, next) => {
  try {
    const {
      title,
      category,
      status = "Draft",
      featured = false,
      excerpt,
      content,
    } = req.body || {};

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog title is required.",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog category is required.",
      });
    }

    if (!excerpt || !excerpt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog excerpt is required.",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog content is required.",
      });
    }

    if (!["Draft", "Published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Draft or Published.",
      });
    }

    // -------------------------------------------------------
    // IMAGE
    // -------------------------------------------------------

    const imageUrl = getUploadedImageUrl(req);

    console.log("========== CREATE BLOG ==========");
    console.log("Title:", title);
    console.log("Category:", category);
    console.log("Status:", status);
    console.log("Featured:", featured);
    console.log("Uploaded file:", req.file);
    console.log("Image URL:", imageUrl);
    console.log("=================================");

    // -------------------------------------------------------
    // CREATE BLOG
    // -------------------------------------------------------

    const blog = await blogService.createBlog({
      title: title.trim(),
      category: category.trim(),
      status,
      featured: parseBoolean(featured),
      excerpt: excerpt.trim(),
      content,
      image_url: imageUrl,
    });

    return res.status(201).json({
      success: true,
      message:
        status === "Published"
          ? "Blog published successfully."
          : "Blog saved as draft successfully.",
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// UPDATE BLOG
// =========================================================

const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required.",
      });
    }

    const {
      title,
      category,
      status,
      featured = false,
      excerpt,
      content,
    } = req.body || {};

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog title is required.",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog category is required.",
      });
    }

    if (!excerpt || !excerpt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog excerpt is required.",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog content is required.",
      });
    }

    if (!["Draft", "Published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Draft or Published.",
      });
    }

    // -------------------------------------------------------
    // IMAGE
    // -------------------------------------------------------
    //
    // IMPORTANT:
    //
    // If a new image is uploaded:
    //
    //     image_url = "/uploads/blogs/new-image.jpg"
    //
    // If no image is uploaded:
    //
    //     image_url = undefined
    //
    // The service should then preserve the existing image.
    //
    // -------------------------------------------------------

    const imageUrl = req.file
      ? getUploadedImageUrl(req)
      : undefined;

    console.log("========== UPDATE BLOG ==========");
    console.log("Blog ID:", id);
    console.log("Title:", title);
    console.log("Category:", category);
    console.log("Status:", status);
    console.log("Featured:", featured);
    console.log("Uploaded file:", req.file);
    console.log("Image URL:", imageUrl);
    console.log("=================================");

    // -------------------------------------------------------
    // UPDATE BLOG
    // -------------------------------------------------------

    const blog = await blogService.updateBlog(id, {
      title: title.trim(),
      category: category.trim(),
      status,
      featured: parseBoolean(featured),
      excerpt: excerpt.trim(),
      content,

      // undefined = keep existing image
      // "/uploads/..." = replace existing image
      image_url: imageUrl,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        status === "Published"
          ? "Blog updated and published successfully."
          : "Blog updated successfully.",
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// DELETE BLOG
// =========================================================

const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required.",
      });
    }

    const deleted = await blogService.deleteBlog(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// TOGGLE PUBLISH
// =========================================================

const togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required.",
      });
    }

    const blog = await blogService.togglePublish(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        blog.status === "Published"
          ? "Blog published successfully."
          : "Blog moved to draft successfully.",
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// INCREMENT VIEWS
// =========================================================

const incrementViews = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required.",
      });
    }

    const result = await blogService.incrementViews(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Published blog not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// STATISTICS
// =========================================================

const getBlogStats = async (req, res, next) => {
  try {
    const stats = await blogService.getBlogStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublish,
  incrementViews,
  getBlogStats,
};