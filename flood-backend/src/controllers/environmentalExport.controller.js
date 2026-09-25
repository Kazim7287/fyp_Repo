
const { influxQueryApi } = require("../../influxdb");
const XLSX = require("xlsx");
const PDFDocument = require("pdfkit");

/*
|--------------------------------------------------------------------------
| Helper: Query Environmental Data
|--------------------------------------------------------------------------
*/

const queryEnvironmentalData = async (req) => {
  const {
    location,
    start = "-30d",
    stop = "now()",
  } = req.query;

  let query = `
    from(bucket: "${process.env.INFLUXDB_BUCKET}")
      |> range(start: ${start}, stop: ${stop})
      |> filter(fn: (r) => r._measurement == "environmental_data")
  `;

  if (location) {
    const escapedLocation = String(location)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');

    query += `
      |> filter(fn: (r) => r.location == "${escapedLocation}")
    `;
  }

  query += `
      |> pivot(
        rowKey: ["_time", "location"],
        columnKey: ["_field"],
        valueColumn: "_value"
      )
      |> sort(columns: ["_time"])
  `;

  const records = [];

  await new Promise((resolve, reject) => {
    influxQueryApi.queryRows(query, {
      next(row, tableMeta) {
        const data = tableMeta.toObject(row);

        records.push({
          timestamp:
            data._time || null,

          location:
            data.location || null,

          latitude:
            data.latitude != null
              ? Number(data.latitude)
              : null,

          longitude:
            data.longitude != null
              ? Number(data.longitude)
              : null,

          temperature:
            data.temperature != null
              ? Number(data.temperature)
              : null,

          humidity:
            data.humidity != null
              ? Number(data.humidity)
              : null,

          rainfall:
            data.rainfall != null
              ? Number(data.rainfall)
              : null,

          soil_moisture:
            data.soil_moisture != null
              ? Number(data.soil_moisture)
              : null,

          wind_speed:
            data.wind_speed != null
              ? Number(data.wind_speed)
              : null,
        });
      },

      error(error) {
        reject(error);
      },

      complete() {
        resolve();
      },
    });
  });

  return records;
};

/*
|--------------------------------------------------------------------------
| JSON Export
|--------------------------------------------------------------------------
*/

const exportEnvironmentalJSON = async (
  req,
  res
) => {
  try {
    const records =
      await queryEnvironmentalData(req);

    return res.status(200).json({
      success: true,

      format: "json",

      count:
        records.length,

      data:
        records,
    });
  } catch (error) {
    console.error(
      "Environmental JSON export error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to export environmental data as JSON",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Excel Export
|--------------------------------------------------------------------------
*/

const exportEnvironmentalExcel = async (
  req,
  res
) => {
  try {
    const records =
      await queryEnvironmentalData(req);

    const worksheet =
      XLSX.utils.json_to_sheet(
        records
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Environmental Data"
    );

    /*
    | Column widths
    */

    worksheet["!cols"] = [
      {
        wch: 24,
      },
      {
        wch: 18,
      },
      {
        wch: 14,
      },
      {
        wch: 14,
      },
      {
        wch: 16,
      },
      {
        wch: 14,
      },
      {
        wch: 16,
      },
      {
        wch: 14,
      },
      {
        wch: 14,
      },
    ];

    const buffer =
      XLSX.write(
        workbook,
        {
          type: "buffer",
          bookType: "xlsx",
        }
      );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="environmental-data.xlsx"'
    );

    return res.send(
      buffer
    );
  } catch (error) {
    console.error(
      "Environmental Excel export error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to export environmental data as Excel",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| PDF Export
|--------------------------------------------------------------------------
*/

const exportEnvironmentalPDF = async (
  req,
  res
) => {
  try {
    const records =
      await queryEnvironmentalData(req);

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="environmental-data.pdf"'
    );

    const doc =
      new PDFDocument({
        margin: 40,
        size: "A4",
      });

    doc.pipe(res);

    /*
    | Header
    */

    doc
      .fontSize(20)
      .text(
        "FloodGuard Environmental Data Report",
        {
          align: "center",
        }
      );

    doc.moveDown();

    doc
      .fontSize(10)
      .text(
        `Generated: ${new Date().toLocaleString(
          "en-PK"
        )}`,
        {
          align: "center",
        }
      );

    doc.moveDown(2);

    /*
    | Report summary
    */

    doc
      .fontSize(12)
      .text(
        `Total Records: ${records.length}`
      );

    if (req.query.location) {
      doc.text(
        `Location: ${req.query.location}`
      );
    } else {
      doc.text(
        "Location: All Locations"
      );
    }

    doc.moveDown();

    /*
    | No records
    */

    if (records.length === 0) {
      doc
        .fontSize(12)
        .text(
          "No environmental records were found for the selected period."
        );

      doc.end();

      return;
    }

    /*
    | Table-like report
    */

    records.forEach(
      (record, index) => {
        doc
          .fontSize(11)
          .text(
            `Record ${index + 1}`
          );

        doc
          .fontSize(9)
          .text(
            `Timestamp: ${
              record.timestamp || "N/A"
            }`
          );

        doc.text(
          `Location: ${
            record.location || "N/A"
          }`
        );

        doc.text(
          `Coordinates: ${
            record.latitude ?? "N/A"
          }, ${
            record.longitude ?? "N/A"
          }`
        );

        doc.text(
          `Temperature: ${
            record.temperature ?? "N/A"
          } °C`
        );

        doc.text(
          `Humidity: ${
            record.humidity ?? "N/A"
          } %`
        );

        doc.text(
          `Rainfall: ${
            record.rainfall ?? "N/A"
          } mm`
        );

        doc.text(
          `Soil Moisture: ${
            record.soil_moisture ?? "N/A"
          } m³/m³`
        );

        doc.text(
          `Wind Speed: ${
            record.wind_speed ?? "N/A"
          } km/h`
        );

        doc.moveDown();

        doc
          .moveTo(40, doc.y)
          .lineTo(555, doc.y)
          .stroke();

        doc.moveDown();

        /*
        | Start a new page when needed
        */

        if (
          doc.y > 700 &&
          index <
            records.length - 1
        ) {
          doc.addPage();
        }
      }
    );

    /*
    | Footer
    */

    doc
      .fontSize(8)
      .text(
        "FloodGuard Environmental Monitoring System",
        40,
        760,
        {
          align: "center",
          width: 515,
        }
      );

    doc.end();
  } catch (error) {
    console.error(
      "Environmental PDF export error:",
      error
    );

    /*
    | If headers have not already been sent,
    | return JSON error.
    */

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to export environmental data as PDF",
        error: error.message,
      });
    }

    res.end();
  }
};

module.exports = {
  queryEnvironmentalData,
  exportEnvironmentalJSON,
  exportEnvironmentalExcel,
  exportEnvironmentalPDF,
};
