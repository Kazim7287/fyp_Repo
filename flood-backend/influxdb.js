const { InfluxDBClient } = require("@influxdata/influxdb3-client");

const influxClient = new InfluxDBClient({
  host: process.env.INFLUX_URL,
  token: process.env.INFLUX_TOKEN
});

module.exports = influxClient;