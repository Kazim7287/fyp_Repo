const blogService = require("../services/blog.service");

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

    const result =
      await blogService.getAllBlogs({
        search,
        status,
        category,
        page: Number(page),
        limit: Number(limit),
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

    const blog =
      await blogService.getBlogById(id);

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
      image_url = null,
    } = req.body;

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog title is required.",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog category is required.",
      });
    }

    if (!excerpt?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog excerpt is required.",
      });
    }

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog content is required.",
      });
    }

    if (
      !["Draft", "Published"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Draft or Published.",
      });
    }

    const blog =
      await blogService.createBlog({
        title: title.trim(),
        category: category.trim(),
        status,
        featured: Boolean(featured),
        excerpt: excerpt.trim(),
        content,
        image_url,
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

    const {
      title,
      category,
      status,
      featured,
      excerpt,
      content,
      image_url = null,
    } = req.body;

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog title is required.",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog category is required.",
      });
    }

    if (!excerpt?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog excerpt is required.",
      });
    }

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog content is required.",
      });
    }

    if (
      !["Draft", "Published"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Draft or Published.",
      });
    }

    const blog =
      await blogService.updateBlog(id, {
        title: title.trim(),
        category: category.trim(),
        status,
        featured: Boolean(featured),
        excerpt: excerpt.trim(),
        content,
        image_url,
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

    const deleted =
      await blogService.deleteBlog(id);

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

const togglePublish = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const blog =
      await blogService.togglePublish(id);

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

const incrementViews = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const result =
      await blogService.incrementViews(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message:
          "Published blog not found.",
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

const getBlogStats = async (
  req,
  res,
  next
) => {
  try {
    const stats =
      await blogService.getBlogStats();

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