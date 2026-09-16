const emergencyService = require("../services/emergency.service");

// =========================================================
// HELPERS
// =========================================================

/**
 * Convert a value into a positive integer.
 *
 * Query parameters and route parameters arrive as strings.
 */
const parsePositiveInteger = (value) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

/**
 * Validate emergency status.
 */
const VALID_STATUSES = [
  "NORMAL",
  "WATCH",
  "WARNING",
  "CRITICAL",
];

/**
 * Validate boolean values.
 *
 * Supports:
 * true
 * false
 * "true"
 * "false"
 * 1
 * 0
 * "1"
 * "0"
 */
const parseBoolean = (value) => {
  if (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  ) {
    return true;
  }

  if (
    value === false ||
    value === "false" ||
    value === 0 ||
    value === "0"
  ) {
    return false;
  }

  return null;
};

/**
 * Validate safe locations.
 *
 * safe_locations must be an array of non-empty strings.
 */
const validateSafeLocations = (safeLocations) => {
  if (!Array.isArray(safeLocations)) {
    return false;
  }

  return safeLocations.length > 0 &&
    safeLocations.every(
      (location) =>
        typeof location === "string" &&
        location.trim().length > 0
    );
};


// =========================================================
// GET ALL EMERGENCY INFORMATION
// =========================================================

const getEmergencyInformation = async (req, res, next) => {
  try {
    const {
      node_id,
      status,
      active_emergency,
    } = req.query;

    // -------------------------------------------------------
    // NODE ID VALIDATION
    // -------------------------------------------------------

    let parsedNodeId = null;

    if (node_id !== undefined) {
      parsedNodeId = parsePositiveInteger(node_id);

      if (!parsedNodeId) {
        return res.status(400).json({
          success: false,
          message: "Invalid node_id.",
        });
      }
    }

    // -------------------------------------------------------
    // STATUS VALIDATION
    // -------------------------------------------------------

    if (
      status !== undefined &&
      !VALID_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be NORMAL, WATCH, WARNING, or CRITICAL.",
      });
    }

    // -------------------------------------------------------
    // ACTIVE EMERGENCY VALIDATION
    // -------------------------------------------------------

    let parsedActiveEmergency = null;

    if (active_emergency !== undefined) {
      parsedActiveEmergency =
        parseBoolean(active_emergency);

      if (parsedActiveEmergency === null) {
        return res.status(400).json({
          success: false,
          message:
            "active_emergency must be true or false.",
        });
      }
    }

    // -------------------------------------------------------
    // GET DATA
    // -------------------------------------------------------

    const result =
      await emergencyService.getEmergencyInformation({
        nodeId: parsedNodeId,
        status,
        activeEmergency: parsedActiveEmergency,
      });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// GET SINGLE EMERGENCY INFORMATION
// =========================================================

const getEmergencyInformationById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------------
    // ID VALIDATION
    // -------------------------------------------------------

    const parsedId = parsePositiveInteger(id);

    if (!parsedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid emergency information ID.",
      });
    }

    // -------------------------------------------------------
    // GET RECORD
    // -------------------------------------------------------

    const emergency =
      await emergencyService.getEmergencyInformationById(
        parsedId
      );

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message:
          "Emergency information not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: emergency,
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// CREATE EMERGENCY INFORMATION
// =========================================================

const createEmergencyInformation = async (
  req,
  res,
  next
) => {
  try {
    const {
      node_id,
      status = "WATCH",
      affected_area,
      active_emergency = false,
      message,
      evacuation_required = false,
      safe_locations = [],
    } = req.body || {};

    // -------------------------------------------------------
    // NODE ID VALIDATION
    // -------------------------------------------------------

    const parsedNodeId =
      parsePositiveInteger(node_id);

    if (!parsedNodeId) {
      return res.status(400).json({
        success: false,
        message: "Valid node_id is required.",
      });
    }

    // -------------------------------------------------------
    // STATUS VALIDATION
    // -------------------------------------------------------

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be NORMAL, WATCH, WARNING, or CRITICAL.",
      });
    }

    // -------------------------------------------------------
    // AFFECTED AREA VALIDATION
    // -------------------------------------------------------

    if (
      !affected_area ||
      typeof affected_area !== "string" ||
      !affected_area.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Affected area is required.",
      });
    }

    // -------------------------------------------------------
    // MESSAGE VALIDATION
    // -------------------------------------------------------

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Emergency message is required.",
      });
    }

    // -------------------------------------------------------
    // ACTIVE EMERGENCY VALIDATION
    // -------------------------------------------------------

    const parsedActiveEmergency =
      parseBoolean(active_emergency);

    if (parsedActiveEmergency === null) {
      return res.status(400).json({
        success: false,
        message:
          "active_emergency must be true or false.",
      });
    }

    // -------------------------------------------------------
    // EVACUATION VALIDATION
    // -------------------------------------------------------

    const parsedEvacuationRequired =
      parseBoolean(evacuation_required);

    if (parsedEvacuationRequired === null) {
      return res.status(400).json({
        success: false,
        message:
          "evacuation_required must be true or false.",
      });
    }

    // -------------------------------------------------------
    // SAFE LOCATIONS VALIDATION
    // -------------------------------------------------------

    if (!validateSafeLocations(safe_locations)) {
      return res.status(400).json({
        success: false,
        message:
          "safe_locations must be a non-empty array of strings.",
      });
    }

    // -------------------------------------------------------
    // CREATE RECORD
    // -------------------------------------------------------

    const emergency =
      await emergencyService.createEmergencyInformation({
        nodeId: parsedNodeId,
        status,
        affectedArea: affected_area.trim(),
        activeEmergency: parsedActiveEmergency,
        message: message.trim(),
        evacuationRequired: parsedEvacuationRequired,
        safeLocations: safe_locations.map(
          (location) => location.trim()
        ),
      });

    return res.status(201).json({
      success: true,
      message:
        "Emergency information created successfully.",
      data: emergency,
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// UPDATE EMERGENCY INFORMATION
// =========================================================

const updateEmergencyInformation = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const parsedId = parsePositiveInteger(id);

    if (!parsedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid emergency information ID.",
      });
    }

    const {
      node_id,
      status,
      affected_area,
      active_emergency,
      message,
      evacuation_required,
      safe_locations,
    } = req.body || {};

    // -------------------------------------------------------
    // NODE ID VALIDATION
    // -------------------------------------------------------

    let parsedNodeId;

    if (node_id !== undefined) {
      parsedNodeId =
        parsePositiveInteger(node_id);

      if (!parsedNodeId) {
        return res.status(400).json({
          success: false,
          message: "Invalid node_id.",
        });
      }
    }

    // -------------------------------------------------------
    // STATUS VALIDATION
    // -------------------------------------------------------

    if (
      status !== undefined &&
      !VALID_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be NORMAL, WATCH, WARNING, or CRITICAL.",
      });
    }

    // -------------------------------------------------------
    // AFFECTED AREA VALIDATION
    // -------------------------------------------------------

    if (
      affected_area !== undefined &&
      (
        typeof affected_area !== "string" ||
        !affected_area.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Affected area cannot be empty.",
      });
    }

    // -------------------------------------------------------
    // MESSAGE VALIDATION
    // -------------------------------------------------------

    if (
      message !== undefined &&
      (
        typeof message !== "string" ||
        !message.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Emergency message cannot be empty.",
      });
    }

    // -------------------------------------------------------
    // ACTIVE EMERGENCY VALIDATION
    // -------------------------------------------------------

    let parsedActiveEmergency;

    if (active_emergency !== undefined) {
      parsedActiveEmergency =
        parseBoolean(active_emergency);

      if (parsedActiveEmergency === null) {
        return res.status(400).json({
          success: false,
          message:
            "active_emergency must be true or false.",
        });
      }
    }

    // -------------------------------------------------------
    // EVACUATION VALIDATION
    // -------------------------------------------------------

    let parsedEvacuationRequired;

    if (evacuation_required !== undefined) {
      parsedEvacuationRequired =
        parseBoolean(evacuation_required);

      if (parsedEvacuationRequired === null) {
        return res.status(400).json({
          success: false,
          message:
            "evacuation_required must be true or false.",
        });
      }
    }

    // -------------------------------------------------------
    // SAFE LOCATIONS VALIDATION
    // -------------------------------------------------------

    if (safe_locations !== undefined) {
      if (!validateSafeLocations(safe_locations)) {
        return res.status(400).json({
          success: false,
          message:
            "safe_locations must be a non-empty array of strings.",
        });
      }
    }

    // -------------------------------------------------------
    // UPDATE RECORD
    // -------------------------------------------------------

    const emergency =
      await emergencyService.updateEmergencyInformation(
        parsedId,
        {
          nodeId: parsedNodeId,
          status,
          affectedArea:
            affected_area !== undefined
              ? affected_area.trim()
              : undefined,
          activeEmergency:
            parsedActiveEmergency,
          message:
            message !== undefined
              ? message.trim()
              : undefined,
          evacuationRequired:
            parsedEvacuationRequired,
          safeLocations:
            safe_locations !== undefined
              ? safe_locations.map(
                  (location) => location.trim()
                )
              : undefined,
        }
      );

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message:
          "Emergency information not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Emergency information updated successfully.",
      data: emergency,
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// DELETE EMERGENCY INFORMATION
// =========================================================

const deleteEmergencyInformation = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const parsedId = parsePositiveInteger(id);

    if (!parsedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid emergency information ID.",
      });
    }

    // -------------------------------------------------------
    // DELETE RECORD
    // -------------------------------------------------------

    const deleted =
      await emergencyService.deleteEmergencyInformation(
        parsedId
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message:
          "Emergency information not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Emergency information deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getEmergencyInformation,
  getEmergencyInformationById,
  createEmergencyInformation,
  updateEmergencyInformation,
  deleteEmergencyInformation,
};