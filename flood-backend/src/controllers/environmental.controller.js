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

    const point = new Point("environmental_data").tag(
      "location",
      String(location)
    );

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

    // Save data to InfluxDB
    writeApi.writePoint(point);
    await writeApi.flush();

    // Prepare real-time data for connected dashboards
    const realtimeData = {
      location: String(location),
      latitude:
        latitude !== undefined && latitude !== null
          ? Number(latitude)
          : null,
      longitude:
        longitude !== undefined && longitude !== null
          ? Number(longitude)
          : null,
      temperature:
        temperature !== undefined && temperature !== null
          ? Number(temperature)
          : null,
      humidity:
        humidity !== undefined && humidity !== null
          ? Number(humidity)
          : null,
      rainfall:
        rainfall !== undefined && rainfall !== null
          ? Number(rainfall)
          : null,
      soil_moisture:
        soil_moisture !== undefined && soil_moisture !== null
          ? Number(soil_moisture)
          : null,
      wind_speed:
        wind_speed !== undefined && wind_speed !== null
          ? Number(wind_speed)
          : null,
      timestamp: new Date().toISOString(),
    };

    // Get Socket.IO instance from Express
    const io = req.app.get("io");

    // Send update to all connected dashboards
    if (io) {
      io.emit("environmental_data_updated", realtimeData);

      console.log(
        "📡 Real-time environmental data emitted:",
        realtimeData
      );
    }

    return res.status(201).json({
      success: true,
      message: "Environmental data saved successfully",
      data: realtimeData,
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