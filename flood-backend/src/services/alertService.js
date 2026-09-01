
const axios = require("axios");
const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| SMTP2GO Configuration
|--------------------------------------------------------------------------
*/

const SMTP2GO_API_URL =
  "https://api.smtp2go.com/v3/email/send";

const SMTP_TIMEOUT = 15000;


/*
|--------------------------------------------------------------------------
| Utility Helpers
|--------------------------------------------------------------------------
*/

/**
 * Safely convert a value to a trimmed string.
 */
const safeString = (value, fallback = "N/A") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  const stringValue = String(value).trim();

  return stringValue || fallback;
};


/**
 * Escape HTML characters.
 */
const escapeHtml = (value) => {
  return safeString(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};


/**
 * Remove duplicate email addresses.
 */
const uniqueEmails = (emails) => {
  return [
    ...new Set(
      emails
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
};


/*
|--------------------------------------------------------------------------
| Format Alert Type
|--------------------------------------------------------------------------
|
| Converts internal database values into user-friendly text.
|
| manual_warning
|     -> Manual Warning
|
| water_level
|     -> Water Level
|
| flood_prediction
|     -> Flood Prediction
|
|--------------------------------------------------------------------------
*/

const formatAlertType = (alertType) => {
  const value = safeString(
    alertType,
    "Flood Alert"
  );

  const alertTypeMap = {
    manual_warning: "Manual Warning",
    water_level: "Water Level Alert",
    flood_prediction: "Flood Prediction",
    rainfall: "Rainfall Alert",
    weather: "Weather Alert",
    sensor: "Sensor Alert",
    system: "System Alert",
  };

  if (alertTypeMap[value]) {
    return alertTypeMap[value];
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


/*
|--------------------------------------------------------------------------
| Alert Theme
|--------------------------------------------------------------------------
*/

const getAlertTheme = (level) => {
  const normalizedLevel =
    safeString(level, "Alert").toLowerCase();

  switch (normalizedLevel) {

    case "critical":
      return {
        color: "#dc2626",
        background: "#fef2f2",
        border: "#fecaca",
        label: "CRITICAL ALERT",
        icon: "🚨",
      };

    case "warning":
      return {
        color: "#d97706",
        background: "#fffbeb",
        border: "#fde68a",
        label: "WARNING ALERT",
        icon: "⚠️",
      };

    case "watch":
      return {
        color: "#2563eb",
        background: "#eff6ff",
        border: "#bfdbfe",
        label: "FLOOD WATCH",
        icon: "🌊",
      };

    default:
      return {
        color: "#475569",
        background: "#f8fafc",
        border: "#cbd5e1",
        label: "FLOOD ALERT",
        icon: "🔔",
      };
  }
};


/*
|--------------------------------------------------------------------------
| Fetch Alert Recipients
|--------------------------------------------------------------------------
*/

const getAlertRecipients = async () => {

  const result = await pool.query(`
    SELECT email
    FROM users
    WHERE status = 'active'
      AND email IS NOT NULL
      AND TRIM(email) <> ''
  `);

  const emails = uniqueEmails(
    result.rows.map(
      (user) => user.email
    )
  );

  if (emails.length === 0) {
    throw new Error(
      "No active users with valid email addresses were found."
    );
  }

  return emails;
};


/*
|--------------------------------------------------------------------------
| Build Plain Text Email
|--------------------------------------------------------------------------
*/

const buildTextEmail = (alert) => {

  const alertType =
    formatAlertType(alert.alert_type);

  return `
FLOOD EARLY WARNING SYSTEM
==============================================

${safeString(
  alert.level,
  "Alert"
).toUpperCase()} ALERT

${safeString(
  alert.title,
  "Flood Warning"
)}

ALERT INFORMATION
----------------------------------------------

Level:
${safeString(alert.level)}

Status:
${safeString(alert.status, "Active")}

Alert Type:
${alertType}

Source:
${safeString(alert.source)}

Location:
${safeString(alert.location)}

Monitoring Station:
${safeString(alert.station)}

Description:
${safeString(alert.description)}

Time:
${safeString(
  alert.created_at,
  new Date().toLocaleString()
)}

----------------------------------------------

This notification was generated automatically by
the Flood Early Warning System.

Please check the monitoring dashboard for the
latest flood conditions and recommendations.

==============================================
`.trim();
};


/*
|--------------------------------------------------------------------------
| Build Professional HTML Email
|--------------------------------------------------------------------------
*/

const buildHtmlEmail = (alert) => {

  const theme =
    getAlertTheme(alert.level);

  const level =
    escapeHtml(
      safeString(
        alert.level,
        "Alert"
      )
    );

  const title =
    escapeHtml(
      safeString(
        alert.title,
        "Flood Warning"
      )
    );

  const description =
    escapeHtml(
      safeString(
        alert.description
      )
    );

  const location =
    escapeHtml(
      safeString(
        alert.location
      )
    );

  const station =
    escapeHtml(
      safeString(
        alert.station
      )
    );

  const status =
    escapeHtml(
      safeString(
        alert.status,
        "Active"
      )
    );

  const source =
    escapeHtml(
      safeString(
        alert.source
      )
    );

  const alertType =
    escapeHtml(
      formatAlertType(
        alert.alert_type
      )
    );

  const createdAt =
    escapeHtml(
      safeString(
        alert.created_at,
        new Date().toLocaleString()
      )
    );


  return `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    Flood Early Warning System
  </title>

</head>


<body
  style="
    margin:0;
    padding:0;
    background:#f1f5f9;
    font-family:Arial,Helvetica,sans-serif;
    color:#0f172a;
  "
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    background:#f1f5f9;
    padding:30px 15px;
  "
>

<tr>

<td align="center">


<!-- ======================================================
     MAIN EMAIL CONTAINER
======================================================= -->

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    max-width:650px;
    background:#ffffff;
    border-radius:14px;
    overflow:hidden;
    box-shadow:0 4px 20px rgba(15,23,42,0.08);
  "
>


<!-- ======================================================
     HEADER
======================================================= -->

<tr>

<td
  style="
    background:#0f172a;
    padding:28px 32px;
    text-align:center;
  "
>

<div
  style="
    font-size:34px;
    margin-bottom:8px;
  "
>
  🌊
</div>


<div
  style="
    color:#ffffff;
    font-size:22px;
    font-weight:700;
    letter-spacing:0.3px;
  "
>
  Flood Early Warning System
</div>


<div
  style="
    color:#94a3b8;
    font-size:13px;
    margin-top:6px;
  "
>
  Automated Emergency Notification
</div>

</td>

</tr>


<!-- ======================================================
     ALERT BANNER
======================================================= -->

<tr>

<td
  style="
    padding:24px 32px 10px 32px;
  "
>

<div
  style="
    background:${theme.background};
    border:1px solid ${theme.border};
    border-left:5px solid ${theme.color};
    border-radius:10px;
    padding:18px;
  "
>


<div
  style="
    color:${theme.color};
    font-size:13px;
    font-weight:700;
    letter-spacing:0.8px;
  "
>
  ${theme.icon}
  ${theme.label}
</div>


<div
  style="
    color:#0f172a;
    font-size:22px;
    font-weight:700;
    margin-top:8px;
  "
>
  ${title}
</div>


<div
  style="
    color:#475569;
    font-size:14px;
    line-height:1.6;
    margin-top:10px;
  "
>
  ${description}
</div>


</div>

</td>

</tr>


<!-- ======================================================
     ALERT INFORMATION
======================================================= -->

<tr>

<td
  style="
    padding:20px 32px;
  "
>


<div
  style="
    color:#0f172a;
    font-size:16px;
    font-weight:700;
    margin-bottom:14px;
  "
>
  Alert Information
</div>


<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    border:1px solid #e2e8f0;
    border-radius:10px;
    overflow:hidden;
  "
>


<!-- Level -->

<tr>

<td
  style="
    padding:12px 14px;
    background:#f8fafc;
    color:#64748b;
    font-size:13px;
    width:40%;
  "
>
  Alert Level
</td>


<td
  style="
    padding:12px 14px;
    font-size:13px;
    font-weight:700;
    color:${theme.color};
  "
>
  ${level}
</td>

</tr>


<!-- Status -->

<tr>

<td
  style="
    padding:12px 14px;
    color:#64748b;
    font-size:13px;
  "
>
  Status
</td>


<td
  style="
    padding:12px 14px;
    font-size:13px;
    font-weight:600;
  "
>
  ${status}
</td>

</tr>


<!-- Alert Type -->

<tr>

<td
  style="
    padding:12px 14px;
    background:#f8fafc;
    color:#64748b;
    font-size:13px;
  "
>
  Alert Type
</td>


<td
  style="
    padding:12px 14px;
    font-size:13px;
    font-weight:600;
  "
>
  ${alertType}
</td>

</tr>


<!-- Source -->

<tr>

<td
  style="
    padding:12px 14px;
    color:#64748b;
    font-size:13px;
  "
>
  Source
</td>


<td
  style="
    padding:12px 14px;
    font-size:13px;
    font-weight:600;
  "
>
  ${source}
</td>

</tr>


<!-- Location -->

<tr>

<td
  style="
    padding:12px 14px;
    background:#f8fafc;
    color:#64748b;
    font-size:13px;
  "
>
  Location
</td>


<td
  style="
    padding:12px 14px;
    font-size:13px;
    font-weight:600;
  "
>
  ${location}
</td>

</tr>


<!-- Monitoring Station -->

<tr>

<td
  style="
    padding:12px 14px;
    color:#64748b;
    font-size:13px;
  "
>
  Monitoring Station
</td>


<td
  style="
    padding:12px 14px;
    font-size:13px;
    font-weight:600;
  "
>
  ${station}
</td>

</tr>


<!-- Time -->

<tr>

<td
  style="
    padding:12px 14px;
    background:#f8fafc;
    color:#64748b;
    font-size:13px;
  "
>
  Time
</td>


<td
  style="
    padding:12px 14px;
    font-size:13px;
    font-weight:600;
  "
>
  ${createdAt}
</td>

</tr>


</table>

</td>

</tr>


<!-- ======================================================
     IMPORTANT NOTICE
======================================================= -->

<tr>

<td
  style="
    padding:0 32px 25px 32px;
  "
>


<div
  style="
    background:#f8fafc;
    border:1px solid #e2e8f0;
    border-radius:10px;
    padding:16px;
    color:#475569;
    font-size:13px;
    line-height:1.6;
  "
>


<strong
  style="
    color:#0f172a;
  "
>
  Important:
</strong>


This notification was generated by the
Flood Early Warning System.

Please review the monitoring dashboard for
the latest flood conditions and recommended
actions.


</div>

</td>

</tr>


<!-- ======================================================
     FOOTER
======================================================= -->

<tr>

<td
  style="
    background:#0f172a;
    padding:22px 32px;
    text-align:center;
  "
>


<div
  style="
    color:#ffffff;
    font-size:13px;
    font-weight:600;
  "
>
  Flood Early Warning System
</div>


<div
  style="
    color:#94a3b8;
    font-size:11px;
    margin-top:6px;
    line-height:1.5;
  "
>
  Automated notification • Please do not reply
  to this email.
</div>


</td>

</tr>


</table>

</td>

</tr>

</table>

</body>

</html>
`;
};


/*
|--------------------------------------------------------------------------
| Send Alert Email
|--------------------------------------------------------------------------
*/

const sendAlertEmail = async (alert) => {

  try {

    /*
    |--------------------------------------------------------------------------
    | Validate Configuration
    |--------------------------------------------------------------------------
    */

    if (!process.env.SMTP2GO_API_KEY) {

      throw new Error(
        "SMTP2GO_API_KEY is missing from environment configuration."
      );

    }


    if (!process.env.ALERT_EMAIL_FROM) {

      throw new Error(
        "ALERT_EMAIL_FROM is missing from environment configuration."
      );

    }


    if (!alert) {

      throw new Error(
        "Alert data is required."
      );

    }


    /*
    |--------------------------------------------------------------------------
    | Get Recipients
    |--------------------------------------------------------------------------
    */

    const recipientEmails =
      await getAlertRecipients();


    /*
    |--------------------------------------------------------------------------
    | Prepare Email
    |--------------------------------------------------------------------------
    */

    const level =
      safeString(
        alert.level,
        "Alert"
      );


    const title =
      safeString(
        alert.title,
        "Flood Warning"
      );


    /*
    |--------------------------------------------------------------------------
    | Professional Email Subject
    |--------------------------------------------------------------------------
    */

    const subject =
      `🌊 Flood Early Warning System | ${level} Alert — ${title}`;


    /*
    |--------------------------------------------------------------------------
    | Email Content
    |--------------------------------------------------------------------------
    */

    const textBody =
      buildTextEmail(alert);


    const htmlBody =
      buildHtmlEmail(alert);


    /*
    |--------------------------------------------------------------------------
    | Send Through SMTP2GO
    |--------------------------------------------------------------------------
    */

    const response =
      await axios.post(
        SMTP2GO_API_URL,
        {
          api_key:
            process.env.SMTP2GO_API_KEY,

          sender:
            process.env.ALERT_EMAIL_FROM,

          to:
            recipientEmails,

          subject,

          text_body:
            textBody,

          html_body:
            htmlBody,
        },
        {
          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          timeout:
            SMTP_TIMEOUT,
        }
      );


    /*
    |--------------------------------------------------------------------------
    | Process SMTP2GO Response
    |--------------------------------------------------------------------------
    */

    const smtpData =
      response.data?.data;


    console.log(
      "========================================"
    );

    console.log(
      "📧 SMTP2GO ALERT EMAIL"
    );

    console.log(
      "Subject:",
      subject
    );

    console.log(
      "Recipients:",
      recipientEmails
    );

    console.log(
      "Response:",
      response.data
    );

    console.log(
      "========================================"
    );


    /*
    |--------------------------------------------------------------------------
    | Detect Delivery Failure
    |--------------------------------------------------------------------------
    */

    if (
      smtpData &&
      (
        smtpData.failed > 0 ||
        smtpData.succeeded === 0
      )
    ) {

      console.error(
        "========================================"
      );

      console.error(
        "❌ ALERT EMAIL DELIVERY FAILED"
      );

      console.error(
        "Failures:",
        smtpData.failures
      );

      console.error(
        "========================================"
      );


      return {

        success: false,

        message:
          "SMTP2GO rejected the alert email.",

        recipients:
          recipientEmails,

        error:
          smtpData.failures ||
          "Unknown SMTP2GO delivery error",

        data:
          response.data,

      };

    }


    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "✅ ALERT EMAIL SENT SUCCESSFULLY"
    );

    console.log(
      "Recipients:",
      recipientEmails
    );

    console.log(
      "========================================"
    );


    return {

      success: true,

      message:
        "Alert email sent successfully.",

      recipients:
        recipientEmails,

      data:
        response.data,

    };

  } catch (error) {

    /*
    |--------------------------------------------------------------------------
    | Error Handling
    |--------------------------------------------------------------------------
    */

    const errorData =
      error.response?.data ||
      error.message ||
      "Unknown SMTP2GO error";


    console.error(
      "========================================"
    );

    console.error(
      "❌ SMTP2GO ALERT EMAIL FAILED"
    );

    console.error(
      "Error:",
      errorData
    );

    console.error(
      "========================================"
    );


    return {

      success: false,

      message:
        "Failed to send alert email.",

      error:
        errorData,

    };

  }

};


/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  sendAlertEmail,
};
