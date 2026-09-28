
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
  CheckCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

import {
  useEffect,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
  fetchRiverLevelData,
} from "../../../store/slices/riverLevelSlice";

const { Title, Text } = Typography;

// ============================================================
// STATUS CONFIGURATION
// ============================================================

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

// ============================================================
// DETERMINE RIVER STATUS
// ============================================================
//
// These thresholds are only UI thresholds for the current
// dashboard representation. Replace them with your official
// FloodGuard/Tolthawk thresholds when finalized.
//
// ============================================================

const getRiverStatus = (level) => {
  if (level === null || level === undefined) {
    return "Unknown";
  }

  const numericLevel = Number(level);

  if (Number.isNaN(numericLevel)) {
    return "Unknown";
  }

  // Temporary dashboard thresholds
  if (numericLevel >= 25) {
    return "Critical";
  }

  if (numericLevel >= 20) {
    return "Warning";
  }

  return "Normal";
};

// ============================================================
// COMPONENT
// ============================================================

const LiveMonitoring = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  // ==========================================================
  // REDUX STATE
  // ==========================================================

  const {
    readings,
    loading,
    error,
    locationName,
    count,
  } = useSelector(
    (state) => state.riverLevel
  );

  // ==========================================================
  // FETCH RIVER DATA
  // ==========================================================

  useEffect(() => {
    dispatch(
      fetchRiverLevelData({
        locationId: 868,
        start: "-7d",
        limit: 5000,
      })
    );
  }, [dispatch]);

  // ==========================================================
  // GET LATEST READING
  // ==========================================================

  const latestReading =
    readings.length > 0
      ? readings[readings.length - 1]
      : null;

  // ==========================================================
  // CURRENT WATER LEVEL
  // ==========================================================

  const currentWaterLevel =
    latestReading?.level ?? null;

  // ==========================================================
  // CURRENT STATUS
  // ==========================================================

  const currentStatus =
    getRiverStatus(
      currentWaterLevel
    );

  // ==========================================================
  // STATION CLICK
  // ==========================================================

  const handleStationClick = () => {
    navigate(
      "/admin/monitoring/868"
    );
  };

  // ==========================================================
  // STATION DATA
  // ==========================================================

  const stations =
    latestReading
      ? [
          {
            id: "868",
            name:
              locationName ||
              latestReading.locationName ||
              "Kabul River Nowshera",

            locationId:
              latestReading.locationId,

            waterLevel:
              latestReading.level,

            unit:
              latestReading.unit || "ft",

            sensorId:
              latestReading.sensorId,

            sensorType:
              latestReading.sensorType,

            timestamp:
              latestReading.timestamp,

            status:
              currentStatus,
          },
        ]
      : [];

  // ==========================================================
  // TABLE COLUMNS
  // ==========================================================

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

          <Text strong>
            {value}
          </Text>
        </Space>
      ),
    },

    {
      title: "Water Level",
      dataIndex: "waterLevel",
      key: "waterLevel",

      render: (
        value,
        record
      ) => (
        <Text strong>
          {Number(value).toFixed(2)}{" "}
          {record.unit}
        </Text>
      ),
    },

    {
      title: "Sensor",
      dataIndex: "sensorId",
      key: "sensorId",

      render: (value) => (
        <Text>
          Sensor {value}
        </Text>
      ),
    },

    {
      title: "Last Updated",
      dataIndex: "timestamp",
      key: "timestamp",

      render: (value) => (
        <Text>
          {value
            ? new Date(
                value
              ).toLocaleString()
            : "N/A"}
        </Text>
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

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalStations =
    stations.length;

  const normalStations =
    stations.filter(
      (station) =>
        station.status ===
        "Normal"
    ).length;

  const warningStations =
    stations.filter(
      (station) =>
        station.status ===
        "Warning"
    ).length;

  const criticalStations =
    stations.filter(
      (station) =>
        station.status ===
        "Critical"
    ).length;

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error) {
    return (
      <div>
        <Title level={3}>
          Live Monitoring
        </Title>

        <Card>
          <Text type="danger">
            Failed to load river monitoring
            data: {error}
          </Text>
        </Card>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

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
          Real-time river condition from
          the FloodGuard monitoring system.
        </Text>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <Row
        gutter={[
          16,
          16,
        ]}
        style={{
          marginBottom: 24,
        }}
      >
        {/* TOTAL STATIONS */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Total Stations"
              value={
                loading
                  ? 0
                  : totalStations
              }
              prefix={
                <EnvironmentOutlined />
              }
            />
          </Card>
        </Col>

        {/* NORMAL */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Normal"
              value={
                loading
                  ? 0
                  : normalStations
              }
              prefix={
                <CheckCircleOutlined />
              }
            />
          </Card>
        </Col>

        {/* WARNING */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Warning"
              value={
                loading
                  ? 0
                  : warningStations
              }
              prefix={
                <WarningOutlined />
              }
            />
          </Card>
        </Col>

        {/* CRITICAL */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Critical"
              value={
                loading
                  ? 0
                  : criticalStations
              }
              prefix={
                <ThunderboltOutlined />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* =====================================================
          CURRENT RIVER LEVEL
      ===================================================== */}

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
          md={12}
        >
          <Card>
            <Statistic
              title={
                locationName ||
                "Kabul River Nowshera"
              }
              value={
                currentWaterLevel !==
                null
                  ? Number(
                      currentWaterLevel
                    ).toFixed(2)
                  : "--"
              }
              suffix={
                latestReading?.unit ||
                "ft"
              }
            />

            <div
              style={{
                marginTop: 12,
              }}
            >
              Current Status:{" "}
              {getStatusTag(
                currentStatus
              )}
            </div>
          </Card>
        </Col>

        <Col
          xs={24}
          md={12}
        >
          <Card>
            <Statistic
              title="Stored Readings"
              value={count}
            />

            <Text type="secondary">
              Data currently loaded from
              InfluxDB
            </Text>
          </Card>
        </Col>
      </Row>

      {/* =====================================================
          STATION TABLE
      ===================================================== */}

      <Card
        title={
          <Space>
            <Badge
              status={
                loading
                  ? "processing"
                  : "success"
              }
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
          loading={loading}
          pagination={false}
          scroll={{
            x: 700,
          }}
          locale={{
            emptyText:
              "No monitoring data available.",
          }}
          onRow={() => ({
            onClick:
              handleStationClick,

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
