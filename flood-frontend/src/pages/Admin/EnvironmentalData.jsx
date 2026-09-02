
import { useEffect, useState } from "react";
import axios from "axios";

import {
  Card,
  Typography,
  Statistic,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Alert,
  Spin,
  Select,
  Button,
  Divider,
} from "antd";

import {
  CloudOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  FireOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

/*
|--------------------------------------------------------------------------
| API URLs
|--------------------------------------------------------------------------
*/

const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast";

const GEOCODING_API =
  "https://geocoding-api.open-meteo.com/v1/search";

/*
|--------------------------------------------------------------------------
| Default Location
|--------------------------------------------------------------------------
|
| Nowshera is used when the page is opened for the first time.
|
*/

const DEFAULT_LOCATION = {
  name: "Nowshera",
  admin1: "Khyber Pakhtunkhwa",
  country: "Pakistan",
  country_code: "PK",
  latitude: 34.0151,
  longitude: 71.9747,
};

/*
|--------------------------------------------------------------------------
| Environmental Data Component
|--------------------------------------------------------------------------
*/

const EnvironmentalData = () => {
  /*
  |--------------------------------------------------------------------------
  | Location State
  |--------------------------------------------------------------------------
  */

  const [location, setLocation] =
    useState(DEFAULT_LOCATION);

  const [searchValue, setSearchValue] =
    useState("");

  const [locations, setLocations] =
    useState([]);

  /*
  |--------------------------------------------------------------------------
  | Weather State
  |--------------------------------------------------------------------------
  */

  const [weather, setWeather] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Loading States
  |--------------------------------------------------------------------------
  */

  const [weatherLoading, setWeatherLoading] =
    useState(true);

  const [searchLoading, setSearchLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Error State
  |--------------------------------------------------------------------------
  */

  const [error, setError] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Search Locations
  |--------------------------------------------------------------------------
  */

  const searchLocations = async (
    value
  ) => {
    if (!value || value.trim().length < 2) {
      setLocations([]);
      return;
    }

    try {
      setSearchLoading(true);

      const response =
        await axios.get(
          GEOCODING_API,
          {
            params: {
              name: value.trim(),
              count: 10,
              language: "en",
              format: "json",
            },
          }
        );

      const results =
        response.data?.results || [];

      setLocations(results);
    } catch (err) {
      console.error(
        "Location search error:",
        err
      );

      setLocations([]);
    } finally {
      setSearchLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Weather
  |--------------------------------------------------------------------------
  */

  const fetchWeather = async (
    selectedLocation = location
  ) => {
    try {
      setWeatherLoading(true);
      setError(null);

      const response =
        await axios.get(
          WEATHER_API,
          {
            params: {
              latitude:
                selectedLocation.latitude,

              longitude:
                selectedLocation.longitude,

              /*
              | Current conditions
              */

              current:
                "temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,soil_moisture_0_to_7cm",

              /*
              | Hourly conditions
              */

              hourly:
                "temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,soil_moisture_0_to_7cm",

              /*
              | Timezone automatically follows
              | selected location.
              */

              timezone:
                "auto",

              /*
              | Units
              */

              temperature_unit:
                "celsius",

              wind_speed_unit:
                "kmh",

              precipitation_unit:
                "mm",
            },
          }
        );

      setWeather(
        response.data
      );
    } catch (err) {
      console.error(
        "Environmental data error:",
        err
      );

      setError(
        "Unable to fetch environmental conditions for this location."
      );
    } finally {
      setWeatherLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Weather Fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchWeather();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Refresh Weather Every 5 Minutes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const interval =
      setInterval(
        () => {
          fetchWeather(location);
        },
        5 * 60 * 1000
      );

    return () => {
      clearInterval(interval);
    };
  }, [location]);

  /*
  |--------------------------------------------------------------------------
  | Location Selection
  |--------------------------------------------------------------------------
  */

  const handleLocationChange =
    (value) => {
      const selected =
        locations.find(
          (item) =>
            `${item.latitude}-${item.longitude}` ===
            value
        );

      if (!selected) {
        return;
      }

      const selectedLocation = {
        name:
          selected.name,

        admin1:
          selected.admin1,

        country:
          selected.country,

        country_code:
          selected.country_code,

        latitude:
          selected.latitude,

        longitude:
          selected.longitude,

        timezone:
          selected.timezone,
      };

      setLocation(
        selectedLocation
      );

      setSearchValue(
        selected.name
      );

      setLocations([]);

      fetchWeather(
        selectedLocation
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Current Weather
  |--------------------------------------------------------------------------
  */

  const current =
    weather?.current;

  const temperature =
    current?.temperature_2m ??
    null;

  const humidity =
    current?.relative_humidity_2m ??
    null;

  const rainfall =
    current?.rain ??
    current?.precipitation ??
    null;

  const windSpeed =
    current?.wind_speed_10m ??
    null;

  const soilMoisture =
    current?.soil_moisture_0_to_7cm ??
    null;

  /*
  |--------------------------------------------------------------------------
  | Status Helper
  |--------------------------------------------------------------------------
  */

  const getStatus = (
    parameter,
    value
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "Unknown";
    }

    /*
    | Rainfall
    */

    if (
      parameter ===
      "Rainfall"
    ) {
      if (value >= 20) {
        return "High";
      }

      if (value >= 5) {
        return "Moderate";
      }

      return "Normal";
    }

    /*
    | Temperature
    */

    if (
      parameter ===
      "Temperature"
    ) {
      if (
        value >= 40 ||
        value <= 5
      ) {
        return "High";
      }

      if (value >= 35) {
        return "Moderate";
      }

      return "Normal";
    }

    /*
    | Humidity
    */

    if (
      parameter ===
      "Humidity"
    ) {
      if (value >= 85) {
        return "High";
      }

      if (value >= 70) {
        return "Moderate";
      }

      return "Normal";
    }

    /*
    | Wind
    */

    if (
      parameter ===
      "Wind Speed"
    ) {
      if (value >= 50) {
        return "High";
      }

      if (value >= 30) {
        return "Moderate";
      }

      return "Normal";
    }

    /*
    | Soil Moisture
    */

    if (
      parameter ===
      "Soil Moisture"
    ) {
      if (value >= 80) {
        return "High";
      }

      if (value >= 50) {
        return "Moderate";
      }

      return "Normal";
    }

    return "Normal";
  };

  /*
  |--------------------------------------------------------------------------
  | Updated Time
  |--------------------------------------------------------------------------
  */

  const updatedTime =
    current?.time
      ? new Date(
          current.time
        ).toLocaleString(
          "en-PK",
          {
            dateStyle:
              "medium",

            timeStyle:
              "short",
          }
        )
      : "Unknown";

  /*
  |--------------------------------------------------------------------------
  | Table Data
  |--------------------------------------------------------------------------
  */

  const data = [
    {
      key: 1,

      parameter:
        "Rainfall",

      value:
        rainfall,

      unit:
        "mm",

      status:
        getStatus(
          "Rainfall",
          rainfall
        ),

      updated:
        updatedTime,

      source:
        "Open-Meteo",
    },

    {
      key: 2,

      parameter:
        "Temperature",

      value:
        temperature,

      unit:
        "°C",

      status:
        getStatus(
          "Temperature",
          temperature
        ),

      updated:
        updatedTime,

      source:
        "Open-Meteo",
    },

    {
      key: 3,

      parameter:
        "Humidity",

      value:
        humidity,

      unit:
        "%",

      status:
        getStatus(
          "Humidity",
          humidity
        ),

      updated:
        updatedTime,

      source:
        "Open-Meteo",
    },

    {
      key: 4,

      parameter:
        "Soil Moisture",

      value:
        soilMoisture,

      unit:
        "m³/m³",

      status:
        getStatus(
          "Soil Moisture",
          soilMoisture
        ),

      updated:
        updatedTime,

      source:
        "Open-Meteo",
    },

    {
      key: 5,

      parameter:
        "Wind Speed",

      value:
        windSpeed,

      unit:
        "km/h",

      status:
        getStatus(
          "Wind Speed",
          windSpeed
        ),

      updated:
        updatedTime,

      source:
        "Open-Meteo",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Table Columns
  |--------------------------------------------------------------------------
  */

  const columns = [
    {
      title:
        "Environmental Parameter",

      dataIndex:
        "parameter",

      key:
        "parameter",

      render:
        (value) => (
          <Text strong>
            {value}
          </Text>
        ),
    },

    {
      title:
        "Current Value",

      key:
        "value",

      render:
        (_, record) => (
          <Text>
            {record.value !==
            null
              ? Number(
                  record.value
                ).toFixed(2)
              : "N/A"}

            {" "}

            {record.unit}
          </Text>
        ),
    },

    {
      title:
        "Status",

      dataIndex:
        "status",

      key:
        "status",

      render:
        (status) => {
          let color =
            "default";

          if (
            status ===
            "Normal"
          ) {
            color =
              "success";
          } else if (
            status ===
            "Moderate"
          ) {
            color =
              "warning";
          } else if (
            status ===
            "High"
          ) {
            color =
              "error";
          }

          return (
            <Tag
              color={
                color
              }
            >
              {status}
            </Tag>
          );
        },
    },

    {
      title:
        "Source",

      dataIndex:
        "source",

      key:
        "source",

      render:
        (source) => (
          <Tag>
            {source}
          </Tag>
        ),
    },

    {
      title:
        "Last Updated",

      dataIndex:
        "updated",

      key:
        "updated",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Loading Screen
  |--------------------------------------------------------------------------
  */

  if (
    weatherLoading &&
    !weather
  ) {
    return (
      <div
        style={{
          minHeight: 400,

          display:
            "flex",

          justifyContent:
            "center",

          alignItems:
            "center",
        }}
      >
        <Spin
          size="large"
        />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div>
      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div
        style={{
          marginBottom: 24,
        }}
      >
        <Title
          level={3}
          style={{
            marginBottom: 4,
          }}
        >
          Environmental Data
        </Title>

        <Text type="secondary">
          Monitor real-time
          environmental
          conditions for
          any selected
          location.
        </Text>
      </div>

      {/* ================================================= */}
      {/* LOCATION SEARCH */}
      {/* ================================================= */}

      <Card
        style={{
          marginBottom: 24,
        }}
      >
        <Space
          direction="vertical"
          size={12}
          style={{
            width: "100%",
          }}
        >
          <Space>
            <EnvironmentOutlined />

            <Text strong>
              Select Monitoring
              Location
            </Text>
          </Space>

          <Select
            showSearch
            allowClear
            value={
              searchValue ||
              undefined
            }
            placeholder="Search city or area e.g. Dubai, Nowshera, Lahore"
            style={{
              width: "100%",
              maxWidth: 700,
            }}
            prefix={
              <SearchOutlined />
            }
            filterOption={
              false
            }
            onSearch={
              searchLocations
            }
            onChange={
              handleLocationChange
            }
            notFoundContent={
              searchLoading ? (
                <Spin
                  size="small"
                />
              ) : (
                "No location found"
              )
            }
            options={locations.map(
              (item) => ({
                value: `${item.latitude}-${item.longitude}`,

                label: (
                  <div>
                    <Text strong>
                      {item.name}
                    </Text>

                    <br />

                    <Text type="secondary">
                      {[
                        item.admin2,
                        item.admin1,
                        item.country,
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          ", "
                        )}
                    </Text>
                  </div>
                ),
              })
            )}
          />

          <Space
            wrap
          >
            <Tag color="blue">
              {location.name}
            </Tag>

            {location.admin1 && (
              <Tag>
                {location.admin1}
              </Tag>
            )}

            <Tag>
              {location.country}
            </Tag>

            <Text type="secondary">
              📍{" "}
              {Number(
                location.latitude
              ).toFixed(5)}
              ,{" "}
              {Number(
                location.longitude
              ).toFixed(5)}
            </Text>
          </Space>
        </Space>
      </Card>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <Alert
          type="error"
          showIcon
          message="Environmental Data Error"
          description={error}
          style={{
            marginBottom: 24,
          }}
        />
      )}

      {/* ================================================= */}
      {/* LOCATION INFO */}
      {/* ================================================= */}

      <Card
        style={{
          marginBottom: 24,
        }}
      >
        <Space
          wrap
          size="middle"
        >
          <EnvironmentOutlined />

          <Text>
            Monitoring Location:
          </Text>

          <Text strong>
            {location.name}
          </Text>

          {location.admin1 && (
            <Text type="secondary">
              {location.admin1}
            </Text>
          )}

          <Text type="secondary">
            {location.country}
          </Text>

          <Tag color="green">
            Live
          </Tag>

          <Button
            icon={
              <ReloadOutlined />
            }
            onClick={() =>
              fetchWeather(
                location
              )
            }
            loading={
              weatherLoading
            }
          >
            Refresh
          </Button>
        </Space>
      </Card>

      {/* ================================================= */}
      {/* STATISTICS */}
      {/* ================================================= */}

      <Row
        gutter={[
          16,
          16,
        ]}
        style={{
          marginBottom: 24,
        }}
      >
        {/* RAINFALL */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Rainfall"
              value={
                rainfall ??
                0
              }
              precision={2}
              suffix="mm"
              prefix={
                <CloudOutlined />
              }
            />

            <Text
              type="secondary"
            >
              Current precipitation
            </Text>
          </Card>
        </Col>

        {/* TEMPERATURE */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Temperature"
              value={
                temperature ??
                0
              }
              precision={1}
              suffix="°C"
              prefix={
                <FireOutlined />
              }
            />

            <Text
              type="secondary"
            >
              2 m above ground
            </Text>
          </Card>
        </Col>

        {/* HUMIDITY */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Humidity"
              value={
                humidity ??
                0
              }
              precision={1}
              suffix="%"
              prefix={
                <ExperimentOutlined />
              }
            />

            <Text
              type="secondary"
            >
              Relative humidity
            </Text>
          </Card>
        </Col>

        {/* WIND */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Wind Speed"
              value={
                windSpeed ??
                0
              }
              precision={1}
              suffix="km/h"
              prefix={
                <ThunderboltOutlined />
              }
            />

            <Text
              type="secondary"
            >
              10 m above ground
            </Text>
          </Card>
        </Col>
      </Row>

      {/* ================================================= */}
      {/* ENVIRONMENTAL TABLE */}
      {/* ================================================= */}

      <Card
        title={
          <Space>
            <CloudOutlined />

            <span>
              Environmental
              Measurements
            </span>
          </Space>
        }
      >
        <Table
          rowKey="key"
          columns={
            columns
          }
          dataSource={
            data
          }
          pagination={
            false
          }
          loading={
            weatherLoading
          }
          scroll={{
            x: "max-content",
          }}
        />
      </Card>

      {/* ================================================= */}
      {/* DATA SOURCE */}
      {/* ================================================= */}

      <Divider />

      <Text
        type="secondary"
      >
        Environmental data
        provided by Open-Meteo.
        Location coordinates
        are obtained through
        Open-Meteo geocoding.
      </Text>
    </div>
  );
};

export default EnvironmentalData;