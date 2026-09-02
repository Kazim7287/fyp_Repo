
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
} from "antd";

import {
  CloudOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  FireOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

/*
|--------------------------------------------------------------------------
| Nowshera Location
|--------------------------------------------------------------------------
|
| These coordinates are used for the Open-Meteo weather request.
|
*/

const NOWSHERA = {
  latitude: 34.0151,
  longitude: 71.9747,
};

/*
|--------------------------------------------------------------------------
| Open-Meteo API
|--------------------------------------------------------------------------
*/

const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast";

/*
|--------------------------------------------------------------------------
| EnvironmentalData Component
|--------------------------------------------------------------------------
*/

const EnvironmentalData = () => {
  const [weather, setWeather] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Fetch Current Environmental Conditions
  |--------------------------------------------------------------------------
  */

  const fetchEnvironmentalData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(OPEN_METEO_URL, {
        params: {
          latitude: NOWSHERA.latitude,
          longitude: NOWSHERA.longitude,

          /*
          | Current weather variables
          */

          current:
            "temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m",

          /*
          | Hourly values allow us to show rainfall history
          | and other measurements later.
          */

          hourly:
            "temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,soil_moisture_0_to_7cm",

          /*
          | Pakistan timezone
          */

          timezone: "Asia/Karachi",

          /*
          | Units
          */

          temperature_unit: "celsius",
          wind_speed_unit: "kmh",
          precipitation_unit: "mm",
        },
      });

      setWeather(response.data);
    } catch (err) {
      console.error(
        "Environmental data error:",
        err
      );

      setError(
        "Unable to fetch environmental data from Open-Meteo."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchEnvironmentalData();

    /*
    | Refresh every 5 minutes
    */

    const interval = setInterval(
      fetchEnvironmentalData,
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading && !weather) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error && !weather) {
    return (
      <Alert
        type="error"
        showIcon
        message="Environmental Data Error"
        description={error}
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Current Values
  |--------------------------------------------------------------------------
  */

  const current = weather?.current;

  const temperature =
    current?.temperature_2m ?? null;

  const humidity =
    current?.relative_humidity_2m ?? null;

  const rainfall =
    current?.rain ?? current?.precipitation ?? null;

  const windSpeed =
    current?.wind_speed_10m ?? null;

  /*
  |--------------------------------------------------------------------------
  | Status Helper
  |--------------------------------------------------------------------------
  */

  const getStatus = (
    parameter,
    value
  ) => {
    if (value === null || value === undefined) {
      return "Unknown";
    }

    /*
    | Rainfall
    */

    if (parameter === "Rainfall") {
      if (value >= 20) return "High";
      if (value >= 5) return "Moderate";

      return "Normal";
    }

    /*
    | Temperature
    */

    if (parameter === "Temperature") {
      if (value >= 40 || value <= 5) {
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

    if (parameter === "Humidity") {
      if (value >= 85) return "High";
      if (value >= 70) return "Moderate";

      return "Normal";
    }

    /*
    | Wind
    */

    if (parameter === "Wind Speed") {
      if (value >= 50) return "High";
      if (value >= 30) return "Moderate";

      return "Normal";
    }

    return "Normal";
  };

  /*
  |--------------------------------------------------------------------------
  | Format Updated Time
  |--------------------------------------------------------------------------
  */

  const updatedTime =
    current?.time
      ? new Date(current.time).toLocaleTimeString(
          "en-PK",
          {
            hour: "2-digit",
            minute: "2-digit",
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
      parameter: "Rainfall",
      value: rainfall,
      unit: "mm",
      status: getStatus(
        "Rainfall",
        rainfall
      ),
      updated: updatedTime,
      source: "Open-Meteo",
    },

    {
      key: 2,
      parameter: "Temperature",
      value: temperature,
      unit: "°C",
      status: getStatus(
        "Temperature",
        temperature
      ),
      updated: updatedTime,
      source: "Open-Meteo",
    },

    {
      key: 3,
      parameter: "Humidity",
      value: humidity,
      unit: "%",
      status: getStatus(
        "Humidity",
        humidity
      ),
      updated: updatedTime,
      source: "Open-Meteo",
    },

    {
      key: 4,
      parameter: "Soil Moisture",
      value: "—",
      unit: "",
      status: "Sensor",
      updated: "ESP32",
      source: "Field Sensor",
    },

    {
      key: 5,
      parameter: "Wind Speed",
      value: windSpeed,
      unit: "km/h",
      status: getStatus(
        "Wind Speed",
        windSpeed
      ),
      updated: updatedTime,
      source: "Open-Meteo",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Table Columns
  |--------------------------------------------------------------------------
  */

  const columns = [
    {
      title: "Environmental Parameter",
      dataIndex: "parameter",
      key: "parameter",

      render: (value) => (
        <Text strong>{value}</Text>
      ),
    },

    {
      title: "Current Value",
      key: "value",

      render: (_, record) => (
        <Text>
          {record.value}{" "}
          {record.unit}
        </Text>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",

      render: (status) => {
        let color = "default";

        if (status === "Normal") {
          color = "success";
        } else if (
          status === "Moderate"
        ) {
          color = "warning";
        } else if (
          status === "High"
        ) {
          color = "error";
        } else if (
          status === "Sensor"
        ) {
          color = "blue";
        }

        return (
          <Tag color={color}>
            {status}
          </Tag>
        );
      },
    },

    {
      title: "Source",
      dataIndex: "source",
      key: "source",

      render: (source) => (
        <Tag>
          {source}
        </Tag>
      ),
    },

    {
      title: "Last Updated",
      dataIndex: "updated",
      key: "updated",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div>
      {/* PAGE HEADER */}

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
          Real-time environmental conditions
          for Nowshera collected from Open-Meteo
          and field sensors.
        </Text>
      </div>

      {/* ERROR WARNING */}

      {error && (
        <Alert
          style={{
            marginBottom: 24,
          }}
          type="warning"
          showIcon
          message={error}
        />
      )}

      {/* LOCATION */}

      <Card
        style={{
          marginBottom: 24,
        }}
      >
        <Space>
          <CloudOutlined />

          <Text>
            Monitoring Location:
          </Text>

          <Text strong>
            Nowshera, Khyber Pakhtunkhwa
          </Text>

          <Tag color="green">
            Live
          </Tag>
        </Space>
      </Card>

      {/* STATISTICS */}

      <Row
        gutter={[16, 16]}
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
                rainfall ?? 0
              }
              precision={1}
              suffix="mm"
              prefix={
                <CloudOutlined />
              }
            />
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
                temperature ?? 0
              }
              precision={1}
              suffix="°C"
              prefix={
                <FireOutlined />
              }
            />
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
                humidity ?? 0
              }
              precision={1}
              suffix="%"
              prefix={
                <ExperimentOutlined />
              }
            />
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
                windSpeed ?? 0
              }
              precision={1}
              suffix="km/h"
              prefix={
                <ThunderboltOutlined />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* TABLE */}

      <Card
        title={
          <Space>
            <CloudOutlined />

            <span>
              Environmental Measurements
            </span>
          </Space>
        }
      >
        <Table
          rowKey="key"
          columns={columns}
          dataSource={data}
          pagination={false}
          loading={loading}
          scroll={{
            x: "max-content",
          }}
        />
      </Card>
    </div>
  );
};

export default EnvironmentalData;
