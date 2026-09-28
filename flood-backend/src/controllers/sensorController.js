const {
  fetchSensorData,
} = require("../services/sensorService");

const {
  writeRiverLevelReadings,
} = require("../services/influxdb.service");

// ============================================================
// GET SENSOR DATA
// ============================================================

const getSensorData = async (req, res) => {
  try {
    const {
      locationId = 868,
      fromDateTime,
      toDateTime,
    } = req.query;

    // --------------------------------------------------------
    // Validate dates
    // --------------------------------------------------------

    if (!fromDateTime || !toDateTime) {
      return res.status(400).json({
        success: false,
        message:
          "fromDateTime and toDateTime are required.",

        example:
          "/api/sensors/data?fromDateTime=09/26/2026&toDateTime=09/27/2026",
      });
    }

    // --------------------------------------------------------
    // Validate location ID
    // --------------------------------------------------------

    const parsedLocationId = Number(locationId);

    if (
      !Number.isInteger(parsedLocationId) ||
      parsedLocationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "locationId must be a valid positive number.",
      });
    }

    // --------------------------------------------------------
    // Fetch data from Tolthawk
    // --------------------------------------------------------

    const sensorData = await fetchSensorData({
      locationId: parsedLocationId,

      chartOptions: 5,

      fromDateTime,

      toDateTime,

      tzOffset: 300,

      isFiltered: false,

      weatherIds: "",

      tidalId: "",

      tidalDatum: "",
    });

    // --------------------------------------------------------
    // Save readings into InfluxDB
    // --------------------------------------------------------

    const influxResult =
      await writeRiverLevelReadings(
        sensorData.readings
      );

    // --------------------------------------------------------
    // Return response
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Sensor data fetched and stored successfully.",

      data: sensorData,

      influx: influxResult,
    });
  } catch (error) {
    console.error(
      "Sensor Controller Error:",
      error.message
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to fetch and store sensor data.",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getSensorData,
};