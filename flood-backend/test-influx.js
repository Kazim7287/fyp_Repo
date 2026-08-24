require("dotenv").config();

const { InfluxDBClient } = require("@influxdata/influxdb3-client");

const client = new InfluxDBClient({
  host: process.env.INFLUX_URL,
  token: process.env.INFLUX_TOKEN,
  database: process.env.INFLUX_DATABASE
});

async function test() {
  try {

    console.log("Testing InfluxDB...");

    // ==========================================
    // TEST QUERY
    // ==========================================

    const result = await client.query(
      "SELECT 1 AS test"
    );

    for await (const row of result) {
      console.log("Query result:", row);
    }

    console.log("Query SUCCESS");

    // ==========================================
    // TEST WRITE
    // ==========================================

    const line =
      "sensor_data,device_id=NODE_001 " +
      "water_level=4.52," +
      "rainfall=12.4," +
      "temperature=28.6," +
      "humidity=71.2," +
      "soil_moisture=58," +
      "flow_rate=2.4";

    console.log("Writing sensor data...");

    await client.write(line);

    console.log("WRITE SUCCESS");

  } catch (error) {

    console.error("FAILED:");
    console.error(error);

  } finally {

    client.close();

  }
}

test();