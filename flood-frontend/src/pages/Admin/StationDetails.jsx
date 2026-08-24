import { useMemo } from "react";

import {
  Card,
  Col,
  Row,
  Typography,
  Tag,
  Space,
  Statistic,
  Descriptions,
  Button,
  Progress,
} from "antd";

import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  WifiOutlined,
  ClockCircleOutlined,
  ApiOutlined,
} from "@ant-design/icons";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

const { Title, Text } = Typography;

/* =========================================================
   SAMPLE STATION DATA
========================================================= */

const stations = [
  {
    id: "NWS-01",
    name: "NWS-01",

    latitude: 34.0151,
    longitude: 71.9746,

    waterLevel: 12.8,
    rainfall: 12,
    flow: 2.4,

    temperature: 28.6,
    humidity: 71.2,
    soilMoisture: 58,

    battery: 94,

    connection: "Connected",

    lastCommunication: "12 seconds ago",

    sensorStatus: "Normal",

    status: "Normal",
  },

  {
    id: "NWS-02",
    name: "NWS-02",

    latitude: 34.0084,
    longitude: 71.9821,

    waterLevel: 14.5,
    rainfall: 38,
    flow: 3.8,

    temperature: 29.4,
    humidity: 76.5,
    soilMoisture: 64,

    battery: 87,

    connection: "Connected",

    lastCommunication: "8 seconds ago",

    sensorStatus: "Normal",

    status: "Warning",
  },

  {
    id: "NWS-03",
    name: "NWS-03",

    latitude: 33.9958,
    longitude: 71.9903,

    waterLevel: 16.2,
    rainfall: 52,
    flow: 5.1,

    temperature: 30.1,
    humidity: 82.4,
    soilMoisture: 73,

    battery: 32,

    connection: "Connected",

    lastCommunication: "15 seconds ago",

    sensorStatus: "Battery Low",

    status: "Critical",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const StationDetails = () => {
  const navigate = useNavigate();

  const { stationId } = useParams();

  /* =======================================================
     FIND STATION
  ======================================================= */

  const station = useMemo(() => {
    return stations.find(
      (item) => item.id === stationId
    );
  }, [stationId]);

  /* =======================================================
     STATION NOT FOUND
  ======================================================= */

  if (!station) {
    return (
      <Card>
        <Title level={4}>
          Station Not Found
        </Title>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() =>
            navigate("/admin/monitoring")
          }
        >
          Back to Monitoring
        </Button>
      </Card>
    );
  }

  /* =======================================================
     STATUS TAG
  ======================================================= */

  const getStatusTag = () => {
    if (station.status === "Normal") {
      return (
        <Tag color="success">
          Normal
        </Tag>
      );
    }

    if (station.status === "Warning") {
      return (
        <Tag color="warning">
          Warning
        </Tag>
      );
    }

    return (
      <Tag color="error">
        Critical
      </Tag>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div>

      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        style={{
          marginBottom: 24,
        }}
      >

        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() =>
            navigate("/admin/monitoring")
          }
          style={{
            paddingLeft: 0,
            marginBottom: 8,
          }}
        >
          Back to Live Monitoring
        </Button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >

          <div>

            <Title
              level={3}
              style={{
                margin: 0,
              }}
            >
              {station.name}
            </Title>

            <Text type="secondary">
              Monitoring Station Details
            </Text>

          </div>

          <div>
            {getStatusTag()}
          </div>

        </div>

      </div>


      {/* ===================================================
          LOCATION
      =================================================== */}

      <Card
        title={
          <Space>
            <EnvironmentOutlined />

            <span>
              Location
            </span>
          </Space>
        }

        style={{
          marginBottom: 16,
        }}
      >

        <Descriptions
          bordered
          column={{
            xs: 1,
            sm: 2,
          }}
        >

          <Descriptions.Item
            label="Station ID"
          >
            <Text strong>
              {station.id}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item
            label="Station Status"
          >
            {getStatusTag()}
          </Descriptions.Item>

          <Descriptions.Item
            label="Latitude"
          >
            {station.latitude}
          </Descriptions.Item>

          <Descriptions.Item
            label="Longitude"
          >
            {station.longitude}
          </Descriptions.Item>

        </Descriptions>

      </Card>


      {/* ===================================================
          CURRENT SENSOR DATA
      =================================================== */}

      <Card
        title={
          <Space>
            <DashboardOutlined />

            <span>
              Current Data
            </span>
          </Space>
        }

        style={{
          marginBottom: 16,
        }}
      >

        <Row
          gutter={[
            16,
            16,
          ]}
        >

          {/* WATER */}

          <Col
            xs={24}
            sm={12}
            lg={4}
          >
            <Card size="small">

              <Statistic
                title="Water Level"
                value={station.waterLevel}
                suffix="m"
                prefix={
                  <DashboardOutlined />
                }
              />

            </Card>
          </Col>


          {/* RAINFALL */}

          <Col
            xs={24}
            sm={12}
            lg={4}
          >
            <Card size="small">

              <Statistic
                title="Rainfall"
                value={station.rainfall}
                suffix="mm"
                prefix={
                  <CloudOutlined />
                }
              />

            </Card>
          </Col>


          {/* FLOW */}

          <Col
            xs={24}
            sm={12}
            lg={4}
          >
            <Card size="small">

              <Statistic
                title="Flow Rate"
                value={station.flow}
                suffix="m/s"
                prefix={
                  <ThunderboltOutlined />
                }
              />

            </Card>
          </Col>


          {/* TEMPERATURE */}

          <Col
            xs={24}
            sm={12}
            lg={4}
          >
            <Card size="small">

              <Statistic
                title="Temperature"
                value={station.temperature}
                suffix="°C"
                prefix={
                  <DashboardOutlined />
                }
              />

            </Card>
          </Col>


          {/* HUMIDITY */}

          <Col
            xs={24}
            sm={12}
            lg={4}
          >
            <Card size="small">

              <Statistic
                title="Humidity"
                value={station.humidity}
                suffix="%"
              />

            </Card>
          </Col>


          {/* SOIL MOISTURE */}

          <Col
            xs={24}
            sm={12}
            lg={4}
          >
            <Card size="small">

              <Statistic
                title="Soil Moisture"
                value={station.soilMoisture}
                suffix="%"
                prefix={
                  <ExperimentOutlined />
                }
              />

            </Card>
          </Col>

        </Row>

      </Card>


      {/* ===================================================
          DEVICE STATUS
      =================================================== */}

      <Card
        title={
          <Space>
            <ApiOutlined />

            <span>
              Device Status
            </span>
          </Space>
        }
      >

        <Row
          gutter={[
            24,
            24,
          ]}
        >

          {/* =================================================
              BATTERY
          ================================================= */}

          <Col
            xs={24}
            md={12}
          >

            <Space
              direction="vertical"
              style={{
                width: "100%",
              }}
            >

              <Space>

                <ThunderboltOutlined />

                <Text strong>
                  Battery
                </Text>

                <Text>
                  {station.battery}%
                </Text>

              </Space>

              <Progress
                percent={station.battery}
                status={
                  station.battery < 40
                    ? "exception"
                    : "normal"
                }
              />

            </Space>

          </Col>


          {/* =================================================
              CONNECTION
          ================================================= */}

          <Col
            xs={24}
            md={12}
          >

            <Descriptions
              column={1}
            >

              <Descriptions.Item
                label={
                  <Space>
                    <WifiOutlined />
                    Connection
                  </Space>
                }
              >

                <Tag
                  color={
                    station.connection ===
                    "Connected"
                      ? "success"
                      : "error"
                  }
                >
                  {station.connection}
                </Tag>

              </Descriptions.Item>


              <Descriptions.Item
                label={
                  <Space>
                    <ClockCircleOutlined />
                    Last Communication
                  </Space>
                }
              >
                {station.lastCommunication}
              </Descriptions.Item>


              <Descriptions.Item
                label="Sensor Status"
              >

                <Tag
                  color={
                    station.sensorStatus ===
                    "Normal"
                      ? "success"
                      : "warning"
                  }
                >
                  {station.sensorStatus}
                </Tag>

              </Descriptions.Item>

            </Descriptions>

          </Col>

        </Row>

      </Card>

    </div>
  );
};

export default StationDetails;