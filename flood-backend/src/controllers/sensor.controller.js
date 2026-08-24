const influxClient =
  require("../../influxdb");

async function createSensorData(
  req,
  res,
  next
) {
  try {
    const {
      device_id,
      water_level,
      rainfall,
      temperature,
      humidity,
      soil_moisture,
      flow_rate
    } = req.body;

    if (!device_id) {
      return res.status(400).json({
        success: false,
        error: "device_id is required"
      });
    }

    const values = {
      water_level: Number(water_level),
      rainfall: Number(rainfall),
      temperature: Number(temperature),
      humidity: Number(humidity),
      soil_moisture: Number(soil_moisture),
      flow_rate: Number(flow_rate)
    };

    if (
      Object.values(values)
        .some(
          value => Number.isNaN(value)
        )
    ) {
      return res.status(400).json({
        success: false,
        error:
          "All sensor values must be valid numbers"
      });
    }

    const line =
      `sensor_data,device_id=${device_id} ` +
      `water_level=${values.water_level},` +
      `rainfall=${values.rainfall},` +
      `temperature=${values.temperature},` +
      `humidity=${values.humidity},` +
      `soil_moisture=${values.soil_moisture},` +
      `flow_rate=${values.flow_rate}`;

    await influxClient.write(
      line,
      process.env.INFLUX_DATABASE
    );

    res.status(201).json({
      success: true,
      message:
        "Sensor data stored successfully",
      data: {
        device_id,
        ...values
      }
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSensorData
};