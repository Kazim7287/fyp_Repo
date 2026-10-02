const pool = require("../config/db");

/**
 * Create a system audit log.
 *
 * @param {Object} data
 * @param {number|null} data.userId
 * @param {string|null} data.userName
 * @param {string} data.action
 * @param {string} data.module
 * @param {string|null} data.resourceType
 * @param {string|number|null} data.resourceId
 * @param {string|null} data.description
 * @param {Object|null} data.oldValues
 * @param {Object|null} data.newValues
 * @param {string|null} data.ipAddress
 * @param {string|null} data.userAgent
 * @param {string} data.status
 * @param {string} data.severity
 */

const createSystemLog = async ({
  userId = null,
  userName = null,
  action,
  module,
  resourceType = null,
  resourceId = null,
  description = null,
  oldValues = null,
  newValues = null,
  ipAddress = null,
  userAgent = null,
  status = "Success",
  severity = "Info",
}) => {
  try {
    const query = `
      INSERT INTO system_logs (
        user_id,
        user_name,
        action,
        module,
        resource_type,
        resource_id,
        description,
        old_values,
        new_values,
        ip_address,
        user_agent,
        status,
        severity
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13
      )
      RETURNING *;
    `;

    const values = [
      userId,
      userName,
      action,
      module,
      resourceType,
      resourceId,
      description,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      status,
      severity,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
  } catch (error) {
    console.error("System log creation failed:", error);

    /*
     * Important:
     * A logging failure should normally NOT break
     * the main operation of the application.
     */
    return null;
  }
};

module.exports = {
  createSystemLog,
};