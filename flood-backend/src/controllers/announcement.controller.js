const announcementService = require("../services/announcement.service");

// =========================================================
// GET ALL ANNOUNCEMENTS
// GET /api/announcements
// =========================================================

const getAnnouncements = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      search,
    } = req.query;

    const announcements =
      await announcementService.getAnnouncements({
        status,
        category,
        priority,
        search,
      });

    return res.status(200).json({
      success: true,
      message: "Announcements fetched successfully.",
      data: announcements,
    });
  } catch (error) {
    console.error(
      "Get announcements error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


// =========================================================
// GET SINGLE ANNOUNCEMENT
// GET /api/announcements/:id
// =========================================================

const getAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement =
      await announcementService.getAnnouncementById(
        id
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement fetched successfully.",
      data: announcement,
    });
  } catch (error) {
    console.error(
      "Get announcement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcement.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


// =========================================================
// CREATE ANNOUNCEMENT
// POST /api/announcements
// =========================================================

const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      category,
      priority,
      status,
      published_at,
      expires_at,
      content,
    } = req.body;

    // -------------------------------------------------------
    // REQUIRED FIELDS
    // -------------------------------------------------------

    if (!title || !category || !content) {
      return res.status(400).json({
        success: false,
        message:
          "Title, category, and content are required.",
      });
    }

    // -------------------------------------------------------
    // VALID PRIORITY
    // -------------------------------------------------------

    const allowedPriorities = [
      "Critical",
      "High",
      "Medium",
      "Low",
    ];

    const announcementPriority =
      priority || "Medium";

    if (
      !allowedPriorities.includes(
        announcementPriority
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid announcement priority.",
      });
    }

    // -------------------------------------------------------
    // VALID STATUS
    // -------------------------------------------------------

    const allowedStatuses = [
      "Draft",
      "Published",
      "Archived",
    ];

    const announcementStatus =
      status || "Draft";

    if (
      !allowedStatuses.includes(
        announcementStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid announcement status.",
      });
    }

    // -------------------------------------------------------
    // AUTHOR
    // -------------------------------------------------------

    const authorId =
      req.user?.id ||
      req.user?.user_id ||
      null;

    // -------------------------------------------------------
    // CREATE
    // -------------------------------------------------------

    const announcement =
      await announcementService.createAnnouncement({
        title: title.trim(),
        category: category.trim(),
        priority: announcementPriority,
        status: announcementStatus,
        published_at:
          published_at || null,
        expires_at:
          expires_at || null,
        content: content.trim(),
        author_id: authorId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Announcement created successfully.",
      data: announcement,
    });
  } catch (error) {
    console.error(
      "Create announcement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create announcement.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


// =========================================================
// UPDATE ANNOUNCEMENT
// PUT /api/announcements/:id
// =========================================================

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      category,
      priority,
      status,
      published_at,
      expires_at,
      content,
    } = req.body;

    // -------------------------------------------------------
    // REQUIRED FIELDS
    // -------------------------------------------------------

    if (!title || !category || !content) {
      return res.status(400).json({
        success: false,
        message:
          "Title, category, and content are required.",
      });
    }

    // -------------------------------------------------------
    // VALID PRIORITY
    // -------------------------------------------------------

    const allowedPriorities = [
      "Critical",
      "High",
      "Medium",
      "Low",
    ];

    const announcementPriority =
      priority || "Medium";

    if (
      !allowedPriorities.includes(
        announcementPriority
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid announcement priority.",
      });
    }

    // -------------------------------------------------------
    // VALID STATUS
    // -------------------------------------------------------

    const allowedStatuses = [
      "Draft",
      "Published",
      "Archived",
    ];

    const announcementStatus =
      status || "Draft";

    if (
      !allowedStatuses.includes(
        announcementStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid announcement status.",
      });
    }

    // -------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------

    const announcement =
      await announcementService.updateAnnouncement(
        id,
        {
          title: title.trim(),
          category: category.trim(),
          priority: announcementPriority,
          status: announcementStatus,
          published_at:
            published_at || null,
          expires_at:
            expires_at || null,
          content: content.trim(),
        }
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Announcement updated successfully.",
      data: announcement,
    });
  } catch (error) {
    console.error(
      "Update announcement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update announcement.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


// =========================================================
// DELETE ANNOUNCEMENT
// DELETE /api/announcements/:id
// =========================================================

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted =
      await announcementService.deleteAnnouncement(
        id
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Announcement deleted successfully.",
      data: deleted,
    });
  } catch (error) {
    console.error(
      "Delete announcement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete announcement.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


// =========================================================
// UPDATE ANNOUNCEMENT STATUS
// PATCH /api/announcements/:id/status
// =========================================================

const updateAnnouncementStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Draft",
      "Published",
      "Archived",
    ];

    if (
      !status ||
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid status is required: Draft, Published, or Archived.",
      });
    }

    const announcement =
      await announcementService.updateAnnouncementStatus(
        id,
        status
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Announcement status updated successfully.",
      data: announcement,
    });
  } catch (error) {
    console.error(
      "Update announcement status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update announcement status.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


// =========================================================
// GET ANNOUNCEMENT STATISTICS
// GET /api/announcements/stats
// =========================================================

const getAnnouncementStats = async (
  req,
  res
) => {
  try {
    const stats =
      await announcementService.getAnnouncementStats();

    return res.status(200).json({
      success: true,
      message:
        "Announcement statistics fetched successfully.",
      data: stats,
    });
  } catch (error) {
    console.error(
      "Get announcement stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch announcement statistics.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  updateAnnouncementStatus,
  getAnnouncementStats,
};