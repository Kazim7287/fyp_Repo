const pool = require("../config/db");

// =========================================================
// VALID EMERGENCY STATUSES
// =========================================================

const VALID_STATUSES = [
  "NORMAL",
  "WATCH",
  "WARNING",
  "CRITICAL",
];


// =========================================================
// SELECT QUERY
// =========================================================
// Reusable SELECT statement.
//
// emergency_information contains the emergency data.
// nodes contains the actual monitoring node/location data.
//
// Relationship:
// emergency_information.node_id
//              ↓
//          nodes.id
// =========================================================

const EMERGENCY_SELECT_QUERY = `
  SELECT
    e.id,
    e.node_id,
    e.status,
    e.affected_area,
    e.updated_at,
    e.active_emergency,
    e.message,
    e.evacuation_required,
    e.safe_locations,
    e.created_at,
    e.updated_at_db,

    n.device_id,
    n.node_name,
    n.location_name,
    n.latitude,
    n.longitude

  FROM emergency_information e

  INNER JOIN nodes n
    ON e.node_id = n.id
`;


// =========================================================
// UTILITY HELPERS
// =========================================================

/**
 * Create an application error with an HTTP status code.
 */
const createServiceError = (message, statusCode = 500) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};


/**
 * Validate node ID.
 */
const validateNodeId = (nodeId) => {
  const parsedNodeId = Number(nodeId);

  if (
    !Number.isInteger(parsedNodeId) ||
    parsedNodeId <= 0
  ) {
    throw createServiceError(
      "Invalid node ID.",
      400
    );
  }

  return parsedNodeId;
};


/**
 * Validate emergency status.
 */
const validateStatus = (status) => {
  if (!VALID_STATUSES.includes(status)) {
    throw createServiceError(
      `Invalid emergency status. Allowed values: ${VALID_STATUSES.join(", ")}.`,
      400
    );
  }

  return status;
};


/**
 * Convert safe locations into JSONB-safe data.
 */
const prepareSafeLocations = (safeLocations) => {
  if (!Array.isArray(safeLocations)) {
    throw createServiceError(
      "safe_locations must be an array.",
      400
    );
  }

  const cleanedLocations = safeLocations
    .map((location) => String(location).trim())
    .filter(Boolean);

  if (cleanedLocations.length === 0) {
    throw createServiceError(
      "At least one safe location is required.",
      400
    );
  }

  return JSON.stringify(cleanedLocations);
};


/**
 * Check whether a monitoring node exists.
 */
const ensureNodeExists = async (nodeId) => {
  const result = await pool.query(
    `
      SELECT
        id,
        device_id,
        node_name,
        location_name,
        latitude,
        longitude

      FROM nodes

      WHERE id = $1

      LIMIT 1
    `,
    [nodeId]
  );

  if (result.rowCount === 0) {
    throw createServiceError(
      `Monitoring node with ID ${nodeId} was not found.`,
      404
    );
  }

  return result.rows[0];
};


// =========================================================
// GET ALL EMERGENCY INFORMATION
// =========================================================
//
// Supported filters:
//
// nodeId
// status
// activeEmergency
//
// Example:
//
// getEmergencyInformation({
//   nodeId: 2,
//   status: "WATCH",
//   activeEmergency: true
// });
//
// =========================================================

const getEmergencyInformation = async ({
  nodeId = null,
  status = null,
  activeEmergency = null,
} = {}) => {

  let query = `
    ${EMERGENCY_SELECT_QUERY}
    WHERE 1 = 1
  `;

  const values = [];

  // =======================================================
  // NODE FILTER
  // =======================================================

  if (
    nodeId !== null &&
    nodeId !== undefined
  ) {
    const parsedNodeId =
      validateNodeId(nodeId);

    values.push(parsedNodeId);

    query += `
      AND e.node_id = $${values.length}
    `;
  }


  // =======================================================
  // STATUS FILTER
  // =======================================================

  if (
    status !== null &&
    status !== undefined &&
    status !== ""
  ) {
    const validatedStatus =
      validateStatus(status);

    values.push(validatedStatus);

    query += `
      AND e.status = $${values.length}
    `;
  }


  // =======================================================
  // ACTIVE EMERGENCY FILTER
  // =======================================================

  if (
    activeEmergency !== null &&
    activeEmergency !== undefined
  ) {

    values.push(activeEmergency);

    query += `
      AND e.active_emergency = $${values.length}
    `;
  }


  // =======================================================
  // ORDER
  // =======================================================

  query += `
    ORDER BY
      e.updated_at DESC,
      e.id DESC
  `;


  // =======================================================
  // EXECUTE QUERY
  // =======================================================

  const result =
    await pool.query(
      query,
      values
    );


  return result.rows;
};


// =========================================================
// GET SINGLE EMERGENCY INFORMATION
// =========================================================

const getEmergencyInformationById = async (
  id
) => {

  const parsedId =
    Number(id);


  // =======================================================
  // VALIDATE ID
  // =======================================================

  if (
    !Number.isInteger(parsedId) ||
    parsedId <= 0
  ) {
    throw createServiceError(
      "Invalid emergency information ID.",
      400
    );
  }


  // =======================================================
  // FETCH RECORD
  // =======================================================

  const query = `
    ${EMERGENCY_SELECT_QUERY}

    WHERE e.id = $1

    LIMIT 1
  `;


  const result =
    await pool.query(
      query,
      [parsedId]
    );


  // =======================================================
  // RECORD NOT FOUND
  // =======================================================

  if (result.rowCount === 0) {
    return null;
  }


  return result.rows[0];
};


// =========================================================
// CREATE EMERGENCY INFORMATION
// =========================================================

const createEmergencyInformation = async ({
  nodeId,
  status,
  affectedArea,
  activeEmergency,
  message,
  evacuationRequired,
  safeLocations,
}) => {

  // =======================================================
  // VALIDATE NODE
  // =======================================================

  const parsedNodeId =
    validateNodeId(nodeId);


  await ensureNodeExists(
    parsedNodeId
  );


  // =======================================================
  // VALIDATE STATUS
  // =======================================================

  const validatedStatus =
    validateStatus(status);


  // =======================================================
  // VALIDATE TEXT FIELDS
  // =======================================================

  const cleanedAffectedArea =
    String(
      affectedArea || ""
    ).trim();


  if (!cleanedAffectedArea) {
    throw createServiceError(
      "Affected area is required.",
      400
    );
  }


  const cleanedMessage =
    String(
      message || ""
    ).trim();


  if (!cleanedMessage) {
    throw createServiceError(
      "Emergency message is required.",
      400
    );
  }


  // =======================================================
  // VALIDATE BOOLEAN VALUES
  // =======================================================

  if (
    typeof activeEmergency !==
    "boolean"
  ) {
    throw createServiceError(
      "active_emergency must be a boolean.",
      400
    );
  }


  if (
    typeof evacuationRequired !==
    "boolean"
  ) {
    throw createServiceError(
      "evacuation_required must be a boolean.",
      400
    );
  }


  // =======================================================
  // PREPARE SAFE LOCATIONS
  // =======================================================

  const preparedSafeLocations =
    prepareSafeLocations(
      safeLocations
    );


  // =======================================================
  // INSERT RECORD
  // =======================================================

  const insertQuery = `
    INSERT INTO emergency_information (
      node_id,
      status,
      affected_area,
      active_emergency,
      message,
      evacuation_required,
      safe_locations
    )

    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7::jsonb
    )

    RETURNING id
  `;


  const insertValues = [
    parsedNodeId,
    validatedStatus,
    cleanedAffectedArea,
    activeEmergency,
    cleanedMessage,
    evacuationRequired,
    preparedSafeLocations,
  ];


  const insertResult =
    await pool.query(
      insertQuery,
      insertValues
    );


  const createdId =
    insertResult.rows[0].id;


  // =======================================================
  // FETCH COMPLETE CREATED RECORD
  // =======================================================

  const createdRecord =
    await getEmergencyInformationById(
      createdId
    );


  return createdRecord;
};


// =========================================================
// UPDATE EMERGENCY INFORMATION
// =========================================================
//
// Partial updates are supported.
//
// Example:
//
// updateEmergencyInformation(1, {
//   status: "WARNING",
//   activeEmergency: true
// });
//
// Only supplied fields are updated.
//
// =========================================================

const updateEmergencyInformation = async (
  id,
  {
    nodeId,
    status,
    affectedArea,
    activeEmergency,
    message,
    evacuationRequired,
    safeLocations,
  } = {}
) => {

  // =======================================================
  // VALIDATE RECORD ID
  // =======================================================

  const parsedId =
    Number(id);


  if (
    !Number.isInteger(parsedId) ||
    parsedId <= 0
  ) {
    throw createServiceError(
      "Invalid emergency information ID.",
      400
    );
  }


  // =======================================================
  // CHECK EXISTING RECORD
  // =======================================================

  const existingRecord =
    await getEmergencyInformationById(
      parsedId
    );


  if (!existingRecord) {
    return null;
  }


  // =======================================================
  // UPDATE DATA
  // =======================================================

  const updateFields = [];
  const values = [];


  // =======================================================
  // NODE ID
  // =======================================================

  if (
    nodeId !== undefined &&
    nodeId !== null
  ) {

    const parsedNodeId =
      validateNodeId(nodeId);


    await ensureNodeExists(
      parsedNodeId
    );


    values.push(parsedNodeId);

    updateFields.push(
      `node_id = $${values.length}`
    );
  }


  // =======================================================
  // STATUS
  // =======================================================

  if (
    status !== undefined &&
    status !== null
  ) {

    const validatedStatus =
      validateStatus(status);


    values.push(
      validatedStatus
    );


    updateFields.push(
      `status = $${values.length}`
    );
  }


  // =======================================================
  // AFFECTED AREA
  // =======================================================

  if (
    affectedArea !== undefined &&
    affectedArea !== null
  ) {

    const cleanedAffectedArea =
      String(
        affectedArea
      ).trim();


    if (!cleanedAffectedArea) {
      throw createServiceError(
        "Affected area cannot be empty.",
        400
      );
    }


    values.push(
      cleanedAffectedArea
    );


    updateFields.push(
      `affected_area = $${values.length}`
    );
  }


  // =======================================================
  // ACTIVE EMERGENCY
  // =======================================================

  if (
    activeEmergency !== undefined &&
    activeEmergency !== null
  ) {

    if (
      typeof activeEmergency !==
      "boolean"
    ) {
      throw createServiceError(
        "active_emergency must be a boolean.",
        400
      );
    }


    values.push(
      activeEmergency
    );


    updateFields.push(
      `active_emergency = $${values.length}`
    );
  }


  // =======================================================
  // MESSAGE
  // =======================================================

  if (
    message !== undefined &&
    message !== null
  ) {

    const cleanedMessage =
      String(
        message
      ).trim();


    if (!cleanedMessage) {
      throw createServiceError(
        "Emergency message cannot be empty.",
        400
      );
    }


    values.push(
      cleanedMessage
    );


    updateFields.push(
      `message = $${values.length}`
    );
  }


  // =======================================================
  // EVACUATION REQUIRED
  // =======================================================

  if (
    evacuationRequired !== undefined &&
    evacuationRequired !== null
  ) {

    if (
      typeof evacuationRequired !==
      "boolean"
    ) {
      throw createServiceError(
        "evacuation_required must be a boolean.",
        400
      );
    }


    values.push(
      evacuationRequired
    );


    updateFields.push(
      `evacuation_required = $${values.length}`
    );
  }


  // =======================================================
  // SAFE LOCATIONS
  // =======================================================

  if (
    safeLocations !== undefined &&
    safeLocations !== null
  ) {

    const preparedSafeLocations =
      prepareSafeLocations(
        safeLocations
      );


    values.push(
      preparedSafeLocations
    );


    updateFields.push(
      `safe_locations = $${values.length}::jsonb`
    );
  }


  // =======================================================
  // CHECK UPDATE FIELDS
  // =======================================================

  if (updateFields.length === 0) {
    throw createServiceError(
      "No fields were provided for update.",
      400
    );
  }


  // =======================================================
  // UPDATED TIMESTAMP
  // =======================================================

  updateFields.push(
    "updated_at = CURRENT_TIMESTAMP"
  );

  updateFields.push(
    "updated_at_db = CURRENT_TIMESTAMP"
  );


  // =======================================================
  // RECORD ID PARAMETER
  // =======================================================

  values.push(parsedId);

  const recordIdParameter =
    `$${values.length}`;


  // =======================================================
  // UPDATE QUERY
  // =======================================================

  const updateQuery = `
    UPDATE emergency_information

    SET
      ${updateFields.join(",\n      ")}

    WHERE id = ${recordIdParameter}

    RETURNING id
  `;


  // =======================================================
  // EXECUTE UPDATE
  // =======================================================

  const updateResult =
    await pool.query(
      updateQuery,
      values
    );


  if (
    updateResult.rowCount === 0
  ) {
    return null;
  }


  // =======================================================
  // FETCH UPDATED RECORD
  // =======================================================

  const updatedRecord =
    await getEmergencyInformationById(
      parsedId
    );


  return updatedRecord;
};


// =========================================================
// DELETE EMERGENCY INFORMATION
// =========================================================

const deleteEmergencyInformation = async (
  id
) => {

  // =======================================================
  // VALIDATE ID
  // =======================================================

  const parsedId =
    Number(id);


  if (
    !Number.isInteger(parsedId) ||
    parsedId <= 0
  ) {
    throw createServiceError(
      "Invalid emergency information ID.",
      400
    );
  }


  // =======================================================
  // DELETE RECORD
  // =======================================================

  const query = `
    DELETE FROM emergency_information

    WHERE id = $1

    RETURNING id
  `;


  const result =
    await pool.query(
      query,
      [parsedId]
    );


  // =======================================================
  // RECORD NOT FOUND
  // =======================================================

  if (result.rowCount === 0) {
    return false;
  }


  return true;
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