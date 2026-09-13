
const newsService = require("../services/news.service");

// =========================================================
// GET ALL NEWS
// =========================================================

const getNews = async (req, res) => {
  try {
    const {
      status,
      category,
      search,
    } = req.query;

    const news = await newsService.getNews({
      status,
      category,
      search,
    });

    return res.status(200).json({
      success: true,
      message: "News fetched successfully.",
      data: news,
    });
  } catch (error) {
    console.error(
      "Get news error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch news.",
      error: error.message,
    });
  }
};

// =========================================================
// GET NEWS BY ID
// =========================================================

const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await newsService.getNewsById(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "News fetched successfully.",
      data: news,
    });
  } catch (error) {
    console.error(
      "Get news by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch news.",
      error: error.message,
    });
  }
};

// =========================================================
// CREATE NEWS
// =========================================================

const createNews = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      published_at,
      publishedAt,
      status,
      featured,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "News title is required.",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "News category is required.",
      });
    }

    if (
      !description ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "News description is required.",
      });
    }

    const allowedStatuses = [
      "Draft",
      "Published",
    ];

    const finalStatus =
      status || "Draft";

    if (
      !allowedStatuses.includes(
        finalStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid news status. Allowed values are Draft and Published.",
      });
    }

    const authorId =
      req.user?.id ||
      req.user?.user_id ||
      null;

    const finalPublishedAt =
      published_at ??
      publishedAt ??
      null;

    const news =
      await newsService.createNews({
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        author_id: authorId,
        published_at: finalPublishedAt,
        status: finalStatus,
        featured: featured ?? false,
      });

    return res.status(201).json({
      success: true,
      message: "News created successfully.",
      data: news,
    });
  } catch (error) {
    console.error(
      "Create news error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create news.",
      error: error.message,
    });
  }
};

// =========================================================
// UPDATE NEWS
// =========================================================

const updateNews = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      category,
      description,
      published_at,
      publishedAt,
      status,
      featured,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "News title is required.",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "News category is required.",
      });
    }

    if (
      !description ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "News description is required.",
      });
    }

    const allowedStatuses = [
      "Draft",
      "Published",
    ];

    const finalStatus =
      status || "Draft";

    if (
      !allowedStatuses.includes(
        finalStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid news status. Allowed values are Draft and Published.",
      });
    }

    const finalPublishedAt =
      published_at ??
      publishedAt ??
      null;

    const news =
      await newsService.updateNews(
        id,
        {
          title: title.trim(),
          category: category.trim(),
          description:
            description.trim(),
          published_at:
            finalPublishedAt,
          status: finalStatus,
          featured: featured ?? false,
        }
      );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "News updated successfully.",
      data: news,
    });
  } catch (error) {
    console.error(
      "Update news error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update news.",
      error: error.message,
    });
  }
};

// =========================================================
// DELETE NEWS
// =========================================================

const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted =
      await newsService.deleteNews(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "News not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "News deleted successfully.",
      data: deleted,
    });
  } catch (error) {
    console.error(
      "Delete news error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete news.",
      error: error.message,
    });
  }
};

// =========================================================
// UPDATE NEWS STATUS
// =========================================================

const updateNewsStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Draft",
      "Published",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values are Draft and Published.",
      });
    }

    const news =
      await newsService.updateNewsStatus(
        id,
        status
      );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "News status updated successfully.",
      data: news,
    });
  } catch (error) {
    console.error(
      "Update news status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update news status.",
      error: error.message,
    });
  }
};

// =========================================================
// UPDATE FEATURED STATUS
// =========================================================

const updateNewsFeatured = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    if (
      typeof featured !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Featured must be a boolean value.",
      });
    }

    const news =
      await newsService.updateNewsFeatured(
        id,
        featured
      );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "News featured status updated successfully.",
      data: news,
    });
  } catch (error) {
    console.error(
      "Update news featured error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update featured status.",
      error: error.message,
    });
  }
};

// =========================================================
// GET NEWS STATISTICS
// =========================================================

const getNewsStats = async (
  req,
  res
) => {
  try {
    const stats =
      await newsService.getNewsStats();

    return res.status(200).json({
      success: true,
      message:
        "News statistics fetched successfully.",
      data: stats,
    });
  } catch (error) {
    console.error(
      "Get news statistics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch news statistics.",
      error: error.message,
    });
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  updateNewsStatus,
  updateNewsFeatured,
  getNewsStats,
};
