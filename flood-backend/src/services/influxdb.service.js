const {
  InfluxDB,
  Point,
} = require("@influxdata/influxdb-client");

const influxDB = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token: process.env.INFLUXDB_TOKEN,
});

const writeApi = influxDB.getWriteApi(
  process.env.INFLUXDB_ORG,
  process.env.INFLUXDB_BUCKET,
  "ms"
);

writeApi.useDefaultTags({
  application: "floodguard",
});

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
  const point = new Point("environmental_data")
    .tag("location", location)
    .floatField("latitude", Number(latitude))
    .floatField("longitude", Number(longitude))
    .floatField("temperature", Number(temperature))
    .floatField("humidity", Number(humidity))
    .floatField("rainfall", Number(rainfall))
    .floatField("soil_moisture", Number(soilMoisture))
    .floatField("wind_speed", Number(windSpeed));

  if (timestamp) {
    point.timestamp(new Date(timestamp));
  }

  writeApi.writePoint(point);

  await writeApi.flush();
};

module.exports = {
  writeEnvironmentalData,
};