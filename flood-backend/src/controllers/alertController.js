const pool = require("../config/db");
const { sendAlertEmail } = require("../services/alertService");

/*
|--------------------------------------------------------------------------
| Generate Alert Code
|--------------------------------------------------------------------------
*/

const generateAlertCode = async () => {
  const result = await pool.query(
    `
    SELECT id
    FROM alerts
    ORDER BY id DESC
    LIMIT 1
    `
  );

  const nextId =
    result.rows.length > 0
      ? result.rows[0].id + 1
      : 1;

  return `ALT-${String(nextId).padStart(6, "0")}`;
};

/*
|--------------------------------------------------------------------------
| GET ALL ALERTS
|--------------------------------------------------------------------------
*/

const getAlerts = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        a.*,
        u.name AS created_by_name
      FROM alerts a
      LEFT JOIN users u
        ON a.created_by = u.id
      ORDER BY a.created_at DESC
      `
    );

    return res.status(200).json({
      success: true,
      alerts: result.rows,
    });
  } catch (error) {
    console.error(
      "Get alerts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alerts.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE ALERT
|--------------------------------------------------------------------------
*/

const getAlertById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        a.*,
        u.name AS created_by_name
      FROM alerts a
      LEFT JOIN users u
        ON a.created_by = u.id
      WHERE a.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Alert not found.",
      });
    }

    return res.status(200).json({
      success: true,
      alert: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get alert error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alert.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE MANUAL ALERT
|--------------------------------------------------------------------------
*/

const createManualAlert = async (req, res) => {
  try {
    const {
      location,
      station,
      level,
      alertType,
      title,
      description,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (
      !location ||
      !level ||
      !title ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Location, level, title and description are required.",
      });
    }

    const allowedLevels = [
      "Watch",
      "Warning",
      "Critical",
    ];

    if (!allowedLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid alert level.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Alert Code
    |--------------------------------------------------------------------------
    */

    const alertCode =
      await generateAlertCode();

    /*
    |--------------------------------------------------------------------------
    | Current User
    |--------------------------------------------------------------------------
    |
    | We expect authentication middleware
    | to put the logged-in user inside req.user.
    |
    */

    const createdBy =
      req.user?.id || null;

    /*
    |--------------------------------------------------------------------------
    | Insert Alert
    |--------------------------------------------------------------------------
    */

    const result = await pool.query(
      `
      INSERT INTO alerts (
        alert_code,
        source,
        alert_type,
        level,
        status,
        title,
        description,
        location,
        station,
        created_by
      )
      VALUES (
        $1,
        'manual',
        $2,
        $3,
        'Active',
        $4,
        $5,
        $6,
        $7,
        $8
      )
      RETURNING *
      `,
      [
        alertCode,
        alertType || "manual_warning",
        level,
        title,
        description,
        location,
        station || null,
        createdBy,
      ]
    );

    const alert = result.rows[0];

    /*
    |--------------------------------------------------------------------------
    | Send Email
    |--------------------------------------------------------------------------
    |
    | Email sending is handled separately.
    |
    */

    let emailResult = null;

    try {
      emailResult =
        await sendAlertEmail(alert);
    } catch (emailError) {
      console.error(
        "Alert email error:",
        emailError
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Email Status
    |--------------------------------------------------------------------------
    */

    if (emailResult?.success) {
      await pool.query(
        `
        UPDATE alerts
        SET email_sent = TRUE
        WHERE id = $1
        `,
        [alert.id]
      );

      alert.email_sent = true;
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message:
        "Manual alert created successfully.",
      alert,
      emailSent:
        emailResult?.success || false,
    });
  } catch (error) {
    console.error(
      "Create manual alert error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create manual alert.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ACKNOWLEDGE ALERT
|--------------------------------------------------------------------------
*/

const acknowledgeAlert = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE alerts
      SET
        status = 'Acknowledged',
        acknowledged_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND status = 'Active'
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Active alert not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Alert acknowledged successfully.",
      alert: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Acknowledge alert error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to acknowledge alert.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| RESOLVE ALERT
|--------------------------------------------------------------------------
*/

const resolveAlert = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE alerts
      SET
        status = 'Resolved',
        resolved_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND status != 'Resolved'
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Alert not found or already resolved.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Alert resolved successfully.",
      alert: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Resolve alert error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to resolve alert.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {
  getAlerts,
  getAlertById,
  createManualAlert,
  acknowledgeAlert,
  resolveAlert,
};