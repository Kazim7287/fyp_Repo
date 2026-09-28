
const {
  fetchSensorData,
} = require("../services/sensorService");

const {
  writeRiverLevelReadings,
  queryRiverLevelReadings,
} = require("../services/influxdb.service");

// ============================================================
// FETCH TOLTHAWK DATA AND STORE IN INFLUXDB
// ============================================================

const getSensorData = async (req, res) => {
  try {
    const {
      locationId = 868,
      regionId = 82,
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
          "/api/sensors/data?fromDateTime=09/11/2026&toDateTime=09/17/2026",
      });
    }

    // --------------------------------------------------------
    // Validate location ID
    // --------------------------------------------------------

    const parsedLocationId = Number(
      locationId
    );

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
    // Validate region ID
    // --------------------------------------------------------

    const parsedRegionId = Number(
      regionId
    );

    if (
      !Number.isInteger(parsedRegionId) ||
      parsedRegionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "regionId must be a valid positive number.",
      });
    }

    // --------------------------------------------------------
    // Fetch data from Tolthawk
    // --------------------------------------------------------

    const sensorData =
      await fetchSensorData({
        locationId: parsedLocationId,
        regionId: parsedRegionId,
        chartOptions: 5,
        fromDateTime,
        toDateTime,
        tzOffset: 300,
        isFiltered: false,
        isPagedData: true,
        weatherIds: "",
        tidalId: "",
        tidalDatum: "",
      });

    // --------------------------------------------------------
    // Store readings in InfluxDB
    // --------------------------------------------------------

    const influxResult =
      await writeRiverLevelReadings(
        sensorData.readings
      );

    // --------------------------------------------------------
    // Response
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
// GET STORED RIVER LEVEL DATA FROM INFLUXDB
// ============================================================

const getRiverLevelData = async (
  req,
  res
) => {
  try {
    const {
      locationId = 868,
      start = "-7d",
      stop = "now()",
      limit = 5000,
    } = req.query;

    // --------------------------------------------------------
    // Validate location ID
    // --------------------------------------------------------

    const parsedLocationId = Number(
      locationId
    );

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
    // Validate limit
    // --------------------------------------------------------

    const parsedLimit = Number(limit);

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit <= 0 ||
      parsedLimit > 10000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "limit must be between 1 and 10000.",
      });
    }

    // --------------------------------------------------------
    // Query InfluxDB
    // --------------------------------------------------------

    const result =
      await queryRiverLevelReadings({
        locationId:
          parsedLocationId,

        start,

        stop,

        limit: parsedLimit,
      });

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "River level data retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      "River Level Controller Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to retrieve river level data.",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getSensorData,
  getRiverLevelData,
};
