import {
  Card,
  Col,
  Row,
  Table,
  Tag,
  Typography,
  Space,
  Statistic,
  Badge,
} from "antd";

import {
  EnvironmentOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ApiOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

/* =========================================================
   SAMPLE MONITORING DATA
   Prototype 1
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
    lastCommunication: "12 sec ago",

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
    lastCommunication: "8 sec ago",

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
    lastCommunication: "15 sec ago",

    sensorStatus: "Battery Low",

    status: "Critical",
  },
];

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const getStatusTag = (status) => {
  switch (status) {
    case "Normal":
      return (
        <Tag
          icon={<CheckCircleOutlined />}
          color="success"
        >
          Normal
        </Tag>
      );

    case "Warning":
      return (
        <Tag
          icon={<WarningOutlined />}
          color="warning"
        >
          Warning
        </Tag>
      );

    case "Critical":
      return (
        <Tag
          icon={<ThunderboltOutlined />}
          color="error"
        >
          Critical
        </Tag>
      );

    default:
      return <Tag>{status}</Tag>;
  }
};

/* =========================================================
   COMPONENT
========================================================= */

const LiveMonitoring = () => {
  const navigate = useNavigate();

  /* =======================================================
     STATION CLICK
  ======================================================= */

  const handleStationClick = (station) => {
    navigate(`/admin/monitoring/${station.id}`);
  };

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = [
    {
      title: "Station",
      dataIndex: "name",
      key: "name",

      render: (value) => (
        <Space>
          <EnvironmentOutlined
            style={{
              color: "#1677ff",
            }}
          />

          <Text strong>{value}</Text>
        </Space>
      ),
    },

    {
      title: "Water",
      dataIndex: "waterLevel",
      key: "waterLevel",

      render: (value) => (
        <Text strong>
          {value} m
        </Text>
      ),
    },

    {
      title: "Rainfall",
      dataIndex: "rainfall",
      key: "rainfall",

      render: (value) => (
        <Space>
          <CloudOutlined />

          <span>
            {value} mm
          </span>
        </Space>
      ),
    },

    {
      title: "Flow",
      dataIndex: "flow",
      key: "flow",

      render: (value) => (
        <Space>
          <ApiOutlined />

          <span>
            {value} m/s
          </span>
        </Space>
      ),
    },

    {
      title: "Battery",
      dataIndex: "battery",
      key: "battery",

      render: (value) => (
        <Space>
          <ThunderboltOutlined />

          <span>
            {value}%
          </span>
        </Space>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",

      render: (value) =>
        getStatusTag(value),
    },
  ];

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalStations = stations.length;

  const normalStations = stations.filter(
    (station) =>
      station.status === "Normal"
  ).length;

  const warningStations = stations.filter(
    (station) =>
      station.status === "Warning"
  ).length;

  const criticalStations = stations.filter(
    (station) =>
      station.status === "Critical"
  ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div>

      {/* =================================================
          PAGE HEADER
      ================================================= */}

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
          Live Monitoring
        </Title>

        <Text type="secondary">
          Real-time condition of all monitoring
          stations.
        </Text>
      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <Row
        gutter={[
          16,
          16,
        ]}
        style={{
          marginBottom: 24,
        }}
      >

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Total Stations"
              value={totalStations}
              prefix={
                <EnvironmentOutlined />
              }
            />
          </Card>
        </Col>


        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Normal"
              value={normalStations}
              prefix={
                <CheckCircleOutlined />
              }
            />
          </Card>
        </Col>


        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Warning"
              value={warningStations}
              prefix={
                <WarningOutlined />
              }
            />
          </Card>
        </Col>


        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Critical"
              value={criticalStations}
              prefix={
                <ThunderboltOutlined />
              }
            />
          </Card>
        </Col>

      </Row>


      {/* =================================================
          STATION TABLE
      ================================================= */}

      <Card
        title={
          <Space>
            <Badge
              status="processing"
            />

            <span>
              Monitoring Stations
            </span>
          </Space>
        }
      >

        <Table
          rowKey="id"

          columns={columns}

          dataSource={stations}

          pagination={false}

          scroll={{
            x: 700,
          }}

          onRow={(record) => ({
            onClick: () =>
              handleStationClick(record),

            style: {
              cursor: "pointer",
            },
          })}
        />

      </Card>

    </div>
  );
};

export default LiveMonitoring;