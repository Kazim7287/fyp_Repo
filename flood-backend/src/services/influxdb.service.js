
const {
  InfluxDB,
  Point,
} = require("@influxdata/influxdb-client");

// ============================================================
// INFLUXDB CONNECTION
// ============================================================

const influxDB = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token: process.env.INFLUXDB_TOKEN,
});

const writeApi = influxDB.getWriteApi(
  process.env.INFLUXDB_ORG,
  process.env.INFLUXDB_BUCKET,
  "ms"
);

const queryApi = influxDB.getQueryApi(
  process.env.INFLUXDB_ORG
);

// ============================================================
// DEFAULT TAGS
// ============================================================

writeApi.useDefaultTags({
  application: "floodguard",
});

// ============================================================
// WRITE ENVIRONMENTAL DATA
// ============================================================

const writeEnvironmentalData = async ({
  location,
  latitude,
  longitude,
  temperature,
  humidity,
  rainfall,
  soilMoisture,
  windSpeed,
  timestamp,
}) => {
  try {
    const point = new Point("environmental_data")
      .tag("location", String(location))
      .floatField("latitude", Number(latitude))
      .floatField("longitude", Number(longitude))
      .floatField("temperature", Number(temperature))
      .floatField("humidity", Number(humidity))
      .floatField("rainfall", Number(rainfall))
      .floatField(
        "soil_moisture",
        Number(soilMoisture)
      )
      .floatField(
        "wind_speed",
        Number(windSpeed)
      );

    // --------------------------------------------------------
    // Timestamp
    // --------------------------------------------------------

    if (timestamp) {
      point.timestamp(new Date(timestamp));
    }

    // --------------------------------------------------------
    // Write point
    // --------------------------------------------------------

    writeApi.writePoint(point);

    await writeApi.flush();

    return {
      success: true,
      written: 1,
      message:
        "Environmental data written successfully.",
    };
  } catch (error) {
    console.error(
      "InfluxDB Environmental Data Error:",
      error.message
    );

    throw error;
  }
};

// ============================================================
// WRITE SINGLE RIVER LEVEL READING
// ============================================================

const writeRiverLevelData = async ({
  locationId,
  locationName,
  sensorId,
  sensorType,
  level,
  seaLevel,
  timestamp,
}) => {
  try {
    // --------------------------------------------------------
    // Validate required values
    // --------------------------------------------------------

    if (
      locationId === undefined ||
      sensorId === undefined ||
      level === undefined ||
      timestamp === undefined
    ) {
      throw new Error(
        "locationId, sensorId, level and timestamp are required."
      );
    }

    // --------------------------------------------------------
    // Validate numeric values
    // --------------------------------------------------------

    const numericLevel = Number(level);
    const numericTimestamp = Number(timestamp);

    if (Number.isNaN(numericLevel)) {
      throw new Error(
        "River level must be a valid number."
      );
    }

    if (Number.isNaN(numericTimestamp)) {
      throw new Error(
        "Timestamp must be a valid number."
      );
    }

    // --------------------------------------------------------
    // Create InfluxDB point
    // --------------------------------------------------------

    const point = new Point("river_level")
      .tag(
        "location_id",
        String(locationId)
      )
      .tag(
        "location_name",
        String(locationName || "")
      )
      .tag(
        "sensor_id",
        String(sensorId)
      )
      .tag(
        "sensor_type",
        String(sensorType || "")
      )
      .floatField(
        "level",
        numericLevel
      );

    // --------------------------------------------------------
    // Sea level
    // --------------------------------------------------------

    if (
      seaLevel !== null &&
      seaLevel !== undefined &&
      !Number.isNaN(Number(seaLevel))
    ) {
      point.floatField(
        "sea_level",
        Number(seaLevel)
      );
    }

    // --------------------------------------------------------
    // Source timestamp
    // Tolthawk x value is Unix milliseconds
    // --------------------------------------------------------

    point.timestamp(
      new Date(numericTimestamp)
    );

    // --------------------------------------------------------
    // Write to InfluxDB
    // --------------------------------------------------------

    writeApi.writePoint(point);

    await writeApi.flush();

    return {
      success: true,
      written: 1,
      message:
        "River level data written successfully.",
    };
  } catch (error) {
    console.error(
      "InfluxDB River Level Error:",
      error.message
    );

    throw error;
  }
};

// ============================================================
// WRITE MULTIPLE RIVER LEVEL READINGS
// ============================================================

const writeRiverLevelReadings = async (
  readings = []
) => {
  try {
    // --------------------------------------------------------
    // Validate readings
    // --------------------------------------------------------

    if (!Array.isArray(readings)) {
      throw new Error(
        "Readings must be an array."
      );
    }

    if (readings.length === 0) {
      return {
        success: true,
        written: 0,
        message:
          "No river level readings to write.",
      };
    }

    // --------------------------------------------------------
    // Create points
    // --------------------------------------------------------

    let validReadings = 0;

    for (const reading of readings) {
      // ------------------------------------------------------
      // Validate required data
      // ------------------------------------------------------

      if (
        reading.locationId === undefined ||
        reading.sensorId === undefined ||
        reading.level === undefined ||
        reading.timestamp === undefined
      ) {
        console.warn(
          "Skipping invalid river reading:",
          reading
        );

        continue;
      }

      const numericLevel = Number(
        reading.level
      );

      const numericTimestamp = Number(
        reading.timestamp
      );

      if (
        Number.isNaN(numericLevel) ||
        Number.isNaN(numericTimestamp)
      ) {
        console.warn(
          "Skipping invalid numeric river reading:",
          reading
        );

        continue;
      }

      // ------------------------------------------------------
      // Create point
      // ------------------------------------------------------

      const point = new Point("river_level")
        .tag(
          "location_id",
          String(reading.locationId)
        )
        .tag(
          "location_name",
          String(
            reading.locationName || ""
          )
        )
        .tag(
          "sensor_id",
          String(reading.sensorId)
        )
        .tag(
          "sensor_type",
          String(
            reading.sensorType || ""
          )
        )
        .floatField(
          "level",
          numericLevel
        );

      // ------------------------------------------------------
      // Sea level
      // ------------------------------------------------------

      if (
        reading.seaLevel !== null &&
        reading.seaLevel !== undefined &&
        !Number.isNaN(
          Number(reading.seaLevel)
        )
      ) {
        point.floatField(
          "sea_level",
          Number(reading.seaLevel)
        );
      }

      // ------------------------------------------------------
      // Timestamp
      // ------------------------------------------------------

      point.timestamp(
        new Date(numericTimestamp)
      );

      // ------------------------------------------------------
      // Add point to write buffer
      // ------------------------------------------------------

      writeApi.writePoint(point);

      validReadings++;
    }

    // --------------------------------------------------------
    // Nothing valid to write
    // --------------------------------------------------------

    if (validReadings === 0) {
      return {
        success: true,
        written: 0,
        message:
          "No valid river level readings found.",
      };
    }

    // --------------------------------------------------------
    // Flush all points
    // --------------------------------------------------------

    await writeApi.flush();

    return {
      success: true,
      written: validReadings,
      message:
        "River level readings written successfully.",
    };
  } catch (error) {
    console.error(
      "InfluxDB River Level Readings Error:",
      error.message
    );

    throw error;
  }
};

// ============================================================
// QUERY RIVER LEVEL READINGS
// ============================================================

const queryRiverLevelReadings = async ({
  locationId = 868,
  start = "-7d",
  stop = "now()",
  limit = 5000,
} = {}) => {
  try {
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
      throw new Error(
        "locationId must be a valid positive number."
      );
    }

    // --------------------------------------------------------
    // Validate limit
    // --------------------------------------------------------

    const parsedLimit = Number(limit);

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit <= 0
    ) {
      throw new Error(
        "limit must be a valid positive number."
      );
    }

    // --------------------------------------------------------
    // Build Flux query
    // --------------------------------------------------------

    const fluxQuery = `
      from(bucket: "${process.env.INFLUXDB_BUCKET}")
        |> range(
          start: ${start},
          stop: ${stop}
        )
        |> filter(
          fn: (r) =>
            r._measurement == "river_level"
        )
        |> filter(
          fn: (r) =>
            r.location_id == "${parsedLocationId}"
        )
        |> filter(
          fn: (r) =>
            r._field == "level"
        )
        |> sort(
          columns: ["_time"],
          desc: false
        )
        |> limit(
          n: ${parsedLimit}
        )
    `;

    // --------------------------------------------------------
    // Execute query
    // --------------------------------------------------------

    const rows = [];

    await new Promise((resolve, reject) => {
      queryApi.queryRows(
        fluxQuery,
        {
          next(row, tableMeta) {
            const data =
              tableMeta.toObject(row);

            rows.push({
              timestamp: new Date(
                data._time
              ).getTime(),

              level: Number(
                data._value
              ),

              locationId: Number(
                data.location_id
              ),

              locationName:
                data.location_name || "",

              sensorId: Number(
                data.sensor_id
              ),

              sensorType:
                data.sensor_type || "",

              unit: "ft",
            });
          },

          error(error) {
            reject(error);
          },

          complete() {
            resolve();
          },
        }
      );
    });

    // --------------------------------------------------------
    // Return results
    // --------------------------------------------------------

    return {
      success: true,
      count: rows.length,
      readings: rows,
    };
  } catch (error) {
    console.error(
      "InfluxDB River Level Query Error:",
      error.message
    );

    throw new Error(
      error.message ||
        "Failed to query river level data."
    );
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  writeEnvironmentalData,
  writeRiverLevelData,
  writeRiverLevelReadings,
  queryRiverLevelReadings,
};
