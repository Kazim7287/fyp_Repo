const faqService = require("../services/faq.service");

// =========================================================
// GET ALL FAQs
// GET /api/faqs
// =========================================================

const getFAQs = async (req, res) => {
  try {
    const {
      search = "",
      category = "all",
      status = "all",
    } = req.query;

    const faqs = await faqService.getAllFAQs({
      search,
      category,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "FAQs fetched successfully.",
      data: faqs,
    });
  } catch (error) {
    console.error("Get FAQs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs.",
    });
  }
};

// =========================================================
// GET FAQ BY ID
// GET /api/faqs/:id
// =========================================================

const getFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await faqService.getFAQById(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ fetched successfully.",
      data: faq,
    });
  } catch (error) {
    console.error("Get FAQ error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ.",
    });
  }
};

// =========================================================
// CREATE FAQ
// POST /api/faqs
// =========================================================

const createFAQ = async (req, res) => {
  try {
    const {
      question,
      answer,
      category,
      status = "Draft",
      featured = false,
      display_order = 1,
    } = req.body;

    const faq = await faqService.createFAQ({
      question,
      answer,
      category,
      status,
      featured,
      display_order,
    });

    return res.status(201).json({
      success: true,
      message: "FAQ created successfully.",
      data: faq,
    });
  } catch (error) {
    console.error("Create FAQ error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create FAQ.",
    });
  }
};

// =========================================================
// UPDATE FAQ
// PUT /api/faqs/:id
// =========================================================

const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      question,
      answer,
      category,
      status,
      featured,
      display_order,
    } = req.body;

    const faq = await faqService.updateFAQ(id, {
      question,
      answer,
      category,
      status,
      featured,
      display_order,
    });

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully.",
      data: faq,
    });
  } catch (error) {
    console.error("Update FAQ error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update FAQ.",
    });
  }
};

// =========================================================
// DELETE FAQ
// DELETE /api/faqs/:id
// =========================================================

const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFAQ =
      await faqService.deleteFAQ(id);

    if (!deletedFAQ) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully.",
      data: {
        id: deletedFAQ.id,
      },
    });
  } catch (error) {
    console.error("Delete FAQ error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete FAQ.",
    });
  }
};

// =========================================================
// UPDATE FAQ STATUS
// PATCH /api/faqs/:id/status
// =========================================================

const updateFAQStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const faq =
      await faqService.updateFAQStatus(
        id,
        status
      );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        status === "Published"
          ? "FAQ published successfully."
          : "FAQ moved to draft successfully.",
      data: faq,
    });
  } catch (error) {
    console.error(
      "Update FAQ status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update FAQ status.",
    });
  }
};

// =========================================================
// UPDATE FAQ FEATURED
// PATCH /api/faqs/:id/featured
// =========================================================

const updateFAQFeatured = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    const faq =
      await faqService.updateFAQFeatured(
        id,
        featured
      );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: featured
        ? "FAQ marked as featured."
        : "FAQ removed from featured.",
      data: faq,
    });
  } catch (error) {
    console.error(
      "Update FAQ featured error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update FAQ featured status.",
    });
  }
};

// =========================================================
// GET FAQ STATISTICS
// GET /api/faqs/stats
// =========================================================

const getFAQStats = async (req, res) => {
  try {
    const stats =
      await faqService.getFAQStats();

    return res.status(200).json({
      success: true,
      message:
        "FAQ statistics fetched successfully.",
      data: stats,
    });
  } catch (error) {
    console.error(
      "Get FAQ stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch FAQ statistics.",
    });
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  updateFAQStatus,
  updateFAQFeatured,
  getFAQStats,
};