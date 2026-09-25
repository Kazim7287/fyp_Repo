const { InfluxDB } = require("@influxdata/influxdb-client");

const influxDB = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token: process.env.INFLUXDB_TOKEN,
});

const influxQueryApi = influxDB.getQueryApi(process.env.INFLUXDB_ORG);

module.exports = {
  influxDB,
  influxQueryApi,
};
