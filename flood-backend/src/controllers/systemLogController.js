const pool = require("../config/db");

// =========================================================
// GET SYSTEM LOGS
// =========================================================

const getSystemLogs = async (req, res) => {
  try {
    const {
      search = "",
      severity = "all",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const offset = (pageNumber - 1) * limitNumber;

    const conditions = [];
    const values = [];

    // =====================================================
    // SEARCH
    // =====================================================

    if (search.trim() !== "") {
      values.push(`%${search.trim()}%`);

      conditions.push(`
        (
          user_name ILIKE $${values.length}
          OR action ILIKE $${values.length}
          OR module ILIKE $${values.length}
          OR resource_type ILIKE $${values.length}
          OR resource_id ILIKE $${values.length}
          OR description ILIKE $${values.length}
          OR CAST(ip_address AS TEXT) ILIKE $${values.length}
        )
      `);
    }

    // =====================================================
    // SEVERITY
    // =====================================================

    if (severity !== "all") {
      values.push(severity);

      conditions.push(
        `severity = $${values.length}`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // =====================================================
    // TOTAL COUNT
    // =====================================================

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM system_logs
      ${whereClause};
    `;

    const countResult = await pool.query(
      countQuery,
      values
    );

    const total = parseInt(
      countResult.rows[0].total,
      10
    );

    // =====================================================
    // GET LOGS
    // =====================================================

    const dataValues = [...values];

    dataValues.push(limitNumber);
    const limitPosition = dataValues.length;

    dataValues.push(offset);
    const offsetPosition = dataValues.length;

    const logsQuery = `
      SELECT
        id,
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
        severity,
        created_at
      FROM system_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${limitPosition}
      OFFSET $${offsetPosition};
    `;

    const logsResult = await pool.query(
      logsQuery,
      dataValues
    );

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      message: "System logs retrieved successfully.",
      data: {
        logs: logsResult.rows,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(
            total / limitNumber
          ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get system logs error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve system logs.",
    });
  }
};

module.exports = {
  getSystemLogs,
};