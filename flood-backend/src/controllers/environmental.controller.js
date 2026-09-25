
const { Point } = require("@influxdata/influxdb-client");

const { influxDB } = require("../../influxdb");

const writeApi = influxDB.getWriteApi(
  process.env.INFLUXDB_ORG,
  process.env.INFLUXDB_BUCKET,
  "s"
);

const saveEnvironmentalData = async (req, res) => {
  try {
    const {
      location,
      latitude,
      longitude,
      temperature,
      humidity,
      rainfall,
      soil_moisture,
      wind_speed,
    } = req.body;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    const point = new Point("environmental_data")
      .tag("location", String(location));

    if (latitude !== undefined && latitude !== null) {
      point.floatField("latitude", Number(latitude));
    }

    if (longitude !== undefined && longitude !== null) {
      point.floatField("longitude", Number(longitude));
    }

    if (temperature !== undefined && temperature !== null) {
      point.floatField("temperature", Number(temperature));
    }

    if (humidity !== undefined && humidity !== null) {
      point.floatField("humidity", Number(humidity));
    }

    if (rainfall !== undefined && rainfall !== null) {
      point.floatField("rainfall", Number(rainfall));
    }

    if (soil_moisture !== undefined && soil_moisture !== null) {
      point.floatField("soil_moisture", Number(soil_moisture));
    }

    if (wind_speed !== undefined && wind_speed !== null) {
      point.floatField("wind_speed", Number(wind_speed));
    }

    writeApi.writePoint(point);
    await writeApi.flush();

    return res.status(201).json({
      success: true,
      message: "Environmental data saved successfully",
    });
  } catch (error) {
    console.error("InfluxDB environmental data error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save environmental data",
      error: error.message,
    });
  }
};

module.exports = {
  saveEnvironmentalData,
};
