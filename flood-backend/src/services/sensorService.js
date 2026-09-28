const axios = require("axios");

// ============================================================
// TOLTHAWK SENSOR API
// ============================================================

const TOLTHAWK_BASE_URL =
  "https://sensors.tolthawk.com/api/SynchronizedCharts/GetSynchronizedCharts";

// ============================================================
// FETCH SENSOR DATA
// ============================================================

const fetchSensorData = async ({
  locationId = 868,
  chartOptions = 5,
  fromDateTime,
  toDateTime,
  tzOffset = 300,
  isFiltered = false,
  weatherIds = "",
  tidalId = "",
  tidalDatum = "",
} = {}) => {
  try {
    const response = await axios.get(TOLTHAWK_BASE_URL, {
      params: {
        ids: locationId,
        chartOptions,
        fromDateTime,
        toDateTime,
        tzOffset,
        isFiltered,
        weatherIds,
        tidalId,
        tidalDatum,
      },

      timeout: 30000,
    });

    const result = response.data;

    // --------------------------------------------------------
    // Validate API response
    // --------------------------------------------------------

    if (!result?.data?.locations) {
      throw new Error("Invalid response from Tolthawk API");
    }

    const location = result.data.locations[String(locationId)];

    if (!location) {
      throw new Error(
        `Location ${locationId} was not found in Tolthawk response`
      );
    }

    // --------------------------------------------------------
    // Get sensor
    // --------------------------------------------------------

    const sensor = location.sensorData?.["5"];

    if (!sensor) {
      throw new Error(
        `Sensor 5 was not found for location ${locationId}`
      );
    }

    // --------------------------------------------------------
    // Get chart
    // --------------------------------------------------------

    const chart = sensor.chartData?.[0];

    if (!chart) {
      throw new Error(
        `No chart data found for sensor ${sensor.sensorId}`
      );
    }

    // --------------------------------------------------------
    // Extract data points
    // --------------------------------------------------------

    const dataPoints = chart.dataPoints || [];

    // --------------------------------------------------------
    // Convert to clean application format
    // --------------------------------------------------------

    const readings = dataPoints
      .filter((point) => point.x !== undefined && point.y !== undefined)
      .map((point) => ({
        locationId: location.locationId,
        locationName: location.locationName,

        sensorId: sensor.sensorId,
        sensorType: sensor.sensorType,

        timestamp: Number(point.x),

        level: Number(point.y),

        seaLevel:
          point.seaLevel !== undefined
            ? Number(point.seaLevel)
            : null,

        unit: point.dataPointSymbol || "ft",
      }));

    return {
      locationId: location.locationId,
      locationName: location.locationName,

      sensorId: sensor.sensorId,
      sensorType: sensor.sensorType,

      chartId: chart.chartId,

      axisTitle: chart.axisY?.title || "Level/Stage",

      floodCategories: chart.floodCategories || [],

      seaLevelReference:
        chart.seaLevel !== undefined
          ? Number(chart.seaLevel)
          : null,

      readings,
    };
  } catch (error) {
    console.error(
      "Tolthawk Sensor Service Error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch sensor data"
    );
  }
};

module.exports = {
  fetchSensorData,
};