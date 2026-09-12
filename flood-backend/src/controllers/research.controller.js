const researchService = require("../services/research.service");

// =========================================================
// GET ALL RESEARCH
// GET /api/research
// =========================================================

const getResearch = async (req, res) => {
  try {
    const {
      search = "",
      status = "all",
      category = "all",
    } = req.query;

    const research =
      await researchService.getAllResearch({
        search,
        status,
        category,
      });

    return res.status(200).json({
      success: true,
      message: "Research fetched successfully.",
      data: research,
    });
  } catch (error) {
    console.error(
      "Get research error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch research.",
      error: error.message,
    });
  }
};

// =========================================================
// GET SINGLE RESEARCH
// GET /api/research/:id
// =========================================================

const getResearchById = async (req, res) => {
  try {
    const { id } = req.params;

    const research =
      await researchService.getResearchById(id);

    if (!research) {
      return res.status(404).json({
        success: false,
        message: "Research not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Research fetched successfully.",
      data: research,
    });
  } catch (error) {
    console.error(
      "Get research by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch research.",
      error: error.message,
    });
  }
};

// =========================================================
// CREATE RESEARCH
// POST /api/research
// =========================================================

const createResearch = async (req, res) => {
  try {
    const {
      title,
      authors,
      category,
      abstract,
      publicationDate,
      status = "Draft",
    } = req.body;

    // -------------------------------------------------------
    // Validation
    // -------------------------------------------------------

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Research title is required.",
      });
    }

    if (!authors?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Authors are required.",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Research category is required.",
      });
    }

    if (!abstract?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Research abstract is required.",
      });
    }

    if (!publicationDate) {
      return res.status(400).json({
        success: false,
        message:
          "Publication date is required.",
      });
    }

    if (!["Draft", "Published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Draft or Published.",
      });
    }

    // -------------------------------------------------------
    // Image URL
    // -------------------------------------------------------

    let imageUrl = null;

    if (req.file) {
      imageUrl = `/uploads/research/images/${req.file.filename}`;
    }

    // -------------------------------------------------------
    // Create
    // -------------------------------------------------------

    const research =
      await researchService.createResearch({
        title: title.trim(),
        authors: authors.trim(),
        category: category.trim(),
        abstract: abstract.trim(),
        publicationDate,
        status,
        imageUrl,
        pdfUrl: null,
      });

    return res.status(201).json({
      success: true,
      message:
        status === "Published"
          ? "Research published successfully."
          : "Research draft saved successfully.",
      data: research,
    });
  } catch (error) {
    console.error(
      "Create research error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create research.",
      error: error.message,
    });
  }
};

// =========================================================
// UPLOAD RESEARCH PDF
// POST /api/research/:id/pdf
// =========================================================

const uploadResearchPdf = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------------
    // Check research exists
    // -------------------------------------------------------

    const existingResearch =
      await researchService.getResearchById(id);

    if (!existingResearch) {
      return res.status(404).json({
        success: false,
        message: "Research not found.",
      });
    }

    // -------------------------------------------------------
    // Check PDF
    // -------------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Research PDF is required.",
      });
    }

    const pdfUrl =
      `/uploads/research/pdfs/${req.file.filename}`;

    // -------------------------------------------------------
    // Update only PDF
    // -------------------------------------------------------

    const updatedResearch =
      await researchService.updateResearch(
        id,
        {
          title: existingResearch.title,
          authors: existingResearch.authors,
          category: existingResearch.category,
          abstract: existingResearch.abstract,
          publicationDate:
            existingResearch.publication_date,
          status: existingResearch.status,
          imageUrl: null,
          pdfUrl,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Research PDF uploaded successfully.",
      data: updatedResearch,
    });
  } catch (error) {
    console.error(
      "Upload research PDF error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload research PDF.",
      error: error.message,
    });
  }
};

// =========================================================
// UPDATE RESEARCH
// PUT /api/research/:id
// =========================================================

const updateResearch = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      authors,
      category,
      abstract,
      publicationDate,
      status,
    } = req.body;

    // -------------------------------------------------------
    // Check existing research
    // -------------------------------------------------------

    const existingResearch =
      await researchService.getResearchById(id);

    if (!existingResearch) {
      return res.status(404).json({
        success: false,
        message: "Research not found.",
      });
    }

    // -------------------------------------------------------
    // Validation
    // -------------------------------------------------------

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Research title is required.",
      });
    }

    if (!authors?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Authors are required.",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Research category is required.",
      });
    }

    if (!abstract?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Research abstract is required.",
      });
    }

    if (!publicationDate) {
      return res.status(400).json({
        success: false,
        message:
          "Publication date is required.",
      });
    }

    if (!["Draft", "Published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Draft or Published.",
      });
    }

    // -------------------------------------------------------
    // Image
    // -------------------------------------------------------

    let imageUrl = null;

    if (req.file) {
      imageUrl =
        `/uploads/research/images/${req.file.filename}`;
    }

    // -------------------------------------------------------
    // Update
    // -------------------------------------------------------

    const updatedResearch =
      await researchService.updateResearch(
        id,
        {
          title: title.trim(),
          authors: authors.trim(),
          category: category.trim(),
          abstract: abstract.trim(),
          publicationDate,
          status,
          imageUrl,
          pdfUrl: null,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Research updated successfully.",
      data: updatedResearch,
    });
  } catch (error) {
    console.error(
      "Update research error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update research.",
      error: error.message,
    });
  }
};

// =========================================================
// DELETE RESEARCH
// DELETE /api/research/:id
// =========================================================

const deleteResearch = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedResearch =
      await researchService.deleteResearch(id);

    if (!deletedResearch) {
      return res.status(404).json({
        success: false,
        message: "Research not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Research deleted successfully.",
      data: deletedResearch,
    });
  } catch (error) {
    console.error(
      "Delete research error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete research.",
      error: error.message,
    });
  }
};

// =========================================================
// TOGGLE RESEARCH STATUS
// PATCH /api/research/:id/toggle-status
// =========================================================

const toggleResearchStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const existingResearch =
      await researchService.getResearchById(id);

    if (!existingResearch) {
      return res.status(404).json({
        success: false,
        message: "Research not found.",
      });
    }

    const updatedResearch =
      await researchService.toggleResearchStatus(
        id
      );

    return res.status(200).json({
      success: true,
      message:
        updatedResearch.status === "Published"
          ? "Research published successfully."
          : "Research moved to draft.",
      data: updatedResearch,
    });
  } catch (error) {
    console.error(
      "Toggle research status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to change research status.",
      error: error.message,
    });
  }
};

// =========================================================
// GET RESEARCH STATISTICS
// GET /api/research/stats
// =========================================================

const getResearchStats = async (req, res) => {
  try {
    const stats =
      await researchService.getResearchStats();

    return res.status(200).json({
      success: true,
      message:
        "Research statistics fetched successfully.",
      data: stats,
    });
  } catch (error) {
    console.error(
      "Get research stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch research statistics.",
      error: error.message,
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  getResearch,
  getResearchById,
  createResearch,
  uploadResearchPdf,
  updateResearch,
  deleteResearch,
  toggleResearchStatus,
  getResearchStats,
};