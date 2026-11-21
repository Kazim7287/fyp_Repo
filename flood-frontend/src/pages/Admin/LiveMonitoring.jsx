
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import {
  useCallback,
  useEffect,
  useMemo,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
  fetchRiverLevelData,
} from "../../store/slices/riverLevelSlice";

import "./styles/LiveMonitoring.css";

const { Title, Text } = Typography;

// ============================================================
// CONFIGURATION
// ============================================================

const LOCATION_ID = 868;

const FETCH_OPTIONS = {
  locationId: LOCATION_ID,
  start: "-7d",
  limit: 5000,
};

// ============================================================
// RIVER STATUS
// ============================================================

const getRiverStatus = (level) => {
  if (
    level === null ||
    level === undefined ||
    level === ""
  ) {
    return "Unknown";
  }

  const numericLevel = Number(level);

  if (!Number.isFinite(numericLevel)) {
    return "Unknown";
  }

  // Existing provisional dashboard thresholds.
  // Confirm these against official operational criteria.

  if (numericLevel >= 25) {
    return "Critical";
  }

  if (numericLevel >= 20) {
    return "Warning";
  }

  return "Normal";
};

// ============================================================
// STATUS TAG
// ============================================================

const StatusTag = ({ status }) => {
  const statusConfig = {
    Normal: {
      color: "success",
      icon: <CheckCircleOutlined />,
    },

    Warning: {
      color: "warning",
      icon: <WarningOutlined />,
    },

    Critical: {
      color: "error",
      icon: <ThunderboltOutlined />,
    },

    Unknown: {
      color: "default",
      icon: <ClockCircleOutlined />,
    },
  };

  const config =
    statusConfig[status] || statusConfig.Unknown;

  return (
    <Tag
      color={config.color}
      icon={config.icon}
      className="monitoring-status-tag"
    >
      {status || "Unknown"}
    </Tag>
  );
};

// ============================================================
// FORMAT HELPERS
// ============================================================

const formatDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatLevel = (value, unit = "ft") => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return `${numericValue.toFixed(2)} ${unit}`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const LiveMonitoring = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  // ==========================================================
  // REDUX STATE
  // ==========================================================

  const {
    readings = [],
    loading = false,
    error = null,
    locationName,
    count = 0,
  } = useSelector(
    (state) => state.riverLevel || {}
  );

  // ==========================================================
  // FETCH / REFRESH DATA
  // ==========================================================

  const refreshData = useCallback(() => {
    dispatch(
      fetchRiverLevelData(FETCH_OPTIONS)
    );
  }, [dispatch]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ==========================================================
  // LATEST READING
  // ==========================================================

  const latestReading =
    readings.length > 0
      ? readings[readings.length - 1]
      : null;

  const currentWaterLevel =
    latestReading?.level ?? null;

  const currentStatus =
    getRiverStatus(currentWaterLevel);

  // ==========================================================
  // LOCATION
  // ==========================================================

  const currentLocation =
    locationName ||
    latestReading?.locationName ||
    "Kabul River Nowshera";

  // ==========================================================
  // MONITORING NODE DATA
  // ==========================================================

  const nodes = useMemo(() => {
    if (!latestReading) {
      return [];
    }

    return [
      {
        id: String(
          latestReading.locationId || LOCATION_ID
        ),

        name: currentLocation,

        locationId:
          latestReading.locationId || LOCATION_ID,

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
    ];
  }, [
    latestReading,
    currentLocation,
    currentStatus,
  ]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    return {
      reporting: nodes.length,

      normal: nodes.filter(
        (node) => node.status === "Normal"
      ).length,

      warning: nodes.filter(
        (node) => node.status === "Warning"
      ).length,

      critical: nodes.filter(
        (node) => node.status === "Critical"
      ).length,
    };
  }, [nodes]);

  // ==========================================================
  // NODE NAVIGATION
  // ==========================================================

  const handleNodeClick = () => {
    navigate(
      `/admin/monitoring/${LOCATION_ID}`
    );
  };

  // ==========================================================
  // TABLE COLUMNS
  // ==========================================================

  const columns = [
    {
      title: "Monitoring Node",
      dataIndex: "name",
      key: "name",
      width: 250,

      render: (value) => (
        <div className="monitoring-node-cell">

          <span className="monitoring-node-icon">
            <EnvironmentOutlined />
          </span>

          <span className="monitoring-node-copy">

            <Text strong>
              {value}
            </Text>

            <Text
              type="secondary"
              className="monitoring-cell-subtitle"
            >
              Location ID: {LOCATION_ID}
            </Text>

          </span>

        </div>
      ),
    },

    {
      title: "Water Level",
      dataIndex: "waterLevel",
      key: "waterLevel",
      width: 160,

      render: (value, record) => (
        <Text
          strong
          className="monitoring-level-value"
        >
          {formatLevel(value, record.unit)}
        </Text>
      ),
    },

    {
      title: "Sensor",
      dataIndex: "sensorId",
      key: "sensorId",
      width: 150,

      render: (value, record) => (
        <span>

          <Text>
            {value ? `Sensor ${value}` : "—"}
          </Text>

          {record.sensorType && (
            <Text
              type="secondary"
              className="monitoring-cell-subtitle"
            >
              {record.sensorType}
            </Text>
          )}

        </span>
      ),
    },

    {
      title: "Last Received",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 220,

      render: (value) => (
        <Text type="secondary">
          {formatDateTime(value)}
        </Text>
      ),
    },

    {
      title: "Condition",
      dataIndex: "status",
      key: "status",
      width: 130,

      render: (value) => (
        <StatusTag status={value} />
      ),
    },

    {
      title: "",
      key: "action",
      width: 110,
      align: "right",

      render: () => (
        <Button
          type="link"
          onClick={handleNodeClick}
        >
          View Details
        </Button>
      ),
    },
  ];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="live-monitoring-page">

      {/* ====================================================
          PAGE HEADER
      ==================================================== */}

      <div className="monitoring-page-header">

        <div className="monitoring-heading-copy">

          <div className="monitoring-eyebrow">
            FLOODGUARD / OPERATIONS
          </div>

          <Title level={2}>
            Live Monitoring
          </Title>

          <Text type="secondary">
            Monitor incoming river-level readings
            and the latest reported node condition.
          </Text>

        </div>

        <div className="monitoring-header-actions">

          <Badge
            status={
              loading
                ? "processing"
                : error
                  ? "error"
                  : "success"
            }
            text={
              loading
                ? "Updating Data"
                : error
                  ? "Data Issue"
                  : "Latest Data Loaded"
            }
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={refreshData}
            loading={loading}
            className="monitoring-refresh-button"
          >
            Refresh
          </Button>

        </div>

      </div>

      {/* ====================================================
          ERROR MESSAGE
      ==================================================== */}

      {error && (
        <Alert
          className="monitoring-error-alert"
          type="error"
          showIcon
          message="Unable to retrieve monitoring data"
          description={String(error)}
          action={
            <Button
              size="small"
              danger
              onClick={refreshData}
              loading={loading}
            >
              Try Again
            </Button>
          }
        />
      )}

      {/* ====================================================
          NODE OVERVIEW
      ==================================================== */}

      <div className="monitoring-section-heading">

        <div>

          <Title level={5}>
            Node Overview
          </Title>

          <Text type="secondary">
            Current reporting status for the selected river location
          </Text>

        </div>

        <Text
          type="secondary"
          className="monitoring-period-label"
        >
          <ClockCircleOutlined />
          Recent 7-day data window
        </Text>

      </div>

      {/* ====================================================
          SUMMARY CARDS
      ==================================================== */}

      <Row
        gutter={[16, 16]}
        className="monitoring-summary-row"
      >

        <Col xs={12} sm={12} xl={6}>
          <Card className="monitoring-stat-card">

            <Statistic
              title="Nodes Reporting"
              value={
                loading && !latestReading
                  ? "—"
                  : summary.reporting
              }
              prefix={
                <span className="monitoring-stat-icon blue">
                  <EnvironmentOutlined />
                </span>
              }
            />

            <Text
              type="secondary"
              className="monitoring-stat-footnote"
            >
              With a retrieved reading
            </Text>

          </Card>
        </Col>

        <Col xs={12} sm={12} xl={6}>
          <Card className="monitoring-stat-card">

            <Statistic
              title="Normal"
              value={
                loading && !latestReading
                  ? "—"
                  : summary.normal
              }
              valueStyle={{
                color: "#16845b",
              }}
              prefix={
                <span className="monitoring-stat-icon green">
                  <CheckCircleOutlined />
                </span>
              }
            />

            <Text
              type="secondary"
              className="monitoring-stat-footnote"
            >
              Within normal dashboard range
            </Text>

          </Card>
        </Col>

        <Col xs={12} sm={12} xl={6}>
          <Card className="monitoring-stat-card">

            <Statistic
              title="Warning"
              value={
                loading && !latestReading
                  ? "—"
                  : summary.warning
              }
              valueStyle={{
                color: "#c88719",
              }}
              prefix={
                <span className="monitoring-stat-icon amber">
                  <WarningOutlined />
                </span>
              }
            />

            <Text
              type="secondary"
              className="monitoring-stat-footnote"
            >
              Requires closer attention
            </Text>

          </Card>
        </Col>

        <Col xs={12} sm={12} xl={6}>
          <Card className="monitoring-stat-card">

            <Statistic
              title="Critical"
              value={
                loading && !latestReading
                  ? "—"
                  : summary.critical
              }
              valueStyle={{
                color: "#cf3f4b",
              }}
              prefix={
                <span className="monitoring-stat-icon red">
                  <ThunderboltOutlined />
                </span>
              }
            />

            <Text
              type="secondary"
              className="monitoring-stat-footnote"
            >
              Requires urgent review
            </Text>

          </Card>
        </Col>

      </Row>

      {/* ====================================================
          CURRENT RIVER LEVEL + DATA SUMMARY
      ==================================================== */}

      <Row
        gutter={[16, 16]}
        className="monitoring-feature-row"
      >

        <Col xs={24} xl={15}>

          <Card
            className="monitoring-current-card"
            bordered={false}
          >

            <div className="monitoring-current-topline">

              <div>

                <Text className="monitoring-card-kicker">
                  CURRENT RIVER LEVEL
                </Text>

                <Title level={4}>
                  {currentLocation}
                </Title>

              </div>

              <span className="monitoring-current-icon">
                <DashboardOutlined />
              </span>

            </div>

            <div className="monitoring-current-reading">

              <div>

                <div className="monitoring-big-number">

                  {currentWaterLevel !== null &&
                  currentWaterLevel !== undefined &&
                  Number.isFinite(Number(currentWaterLevel))
                    ? Number(currentWaterLevel).toFixed(2)
                    : "—"}

                  <span>
                    {latestReading?.unit || "ft"}
                  </span>

                </div>

                <Text type="secondary">
                  Latest reported water level
                </Text>

              </div>

              <div className="monitoring-current-condition">

                <Text type="secondary">
                  Current Condition
                </Text>

                <StatusTag status={currentStatus} />

              </div>

            </div>

            <div className="monitoring-current-footer">

              <span>
                <ClockCircleOutlined />
                Updated: {formatDateTime(latestReading?.timestamp)}
              </span>

              <span>
                <EnvironmentOutlined />
                Location ID: {LOCATION_ID}
              </span>

            </div>

          </Card>

        </Col>

        <Col xs={24} xl={9}>

          <Card
            className="monitoring-data-card"
            bordered={false}
          >

            <div className="monitoring-data-card-heading">

              <span className="monitoring-data-icon">
                <DatabaseOutlined />
              </span>

              <div>

                <Title level={5}>
                  Data Summary
                </Title>

                <Text type="secondary">
                  Retrieved monitoring records
                </Text>

              </div>

            </div>

            <Statistic
              title="Stored Readings"
              value={count ?? 0}
            />

            <div className="monitoring-data-divider" />

            <div className="monitoring-data-detail">

              <Text type="secondary">
                Selected Location
              </Text>

              <Text strong>
                {currentLocation}
              </Text>

            </div>

            <div className="monitoring-data-detail">

              <Text type="secondary">
                Data Window
              </Text>

              <Text strong>
                Last 7 Days
              </Text>

            </div>

            <div className="monitoring-data-detail">

              <Text type="secondary">
                Latest Timestamp
              </Text>

              <Text strong>
                {formatDateTime(latestReading?.timestamp)}
              </Text>

            </div>

          </Card>

        </Col>

      </Row>

      {/* ====================================================
          MONITORING TABLE
      ==================================================== */}

      <Card
        className="monitoring-table-card"
        bordered={false}
        title={
          <div className="monitoring-table-title">

            <div>

              <Title level={5}>
                Monitoring Nodes
              </Title>

              <Text type="secondary">
                Latest available reading for the selected location
              </Text>

            </div>

            <Tag className="monitoring-record-count">
              {nodes.length} {nodes.length === 1 ? "Record" : "Records"}
            </Tag>

          </div>
        }
      >

        <Table
          rowKey="id"
          columns={columns}
          dataSource={nodes}
          loading={loading}
          pagination={false}
          scroll={{
            x: 900,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  loading
                    ? "Loading monitoring data…"
                    : "No monitoring readings are available for this location."
                }
              />
            ),
          }}
          onRow={() => ({
            onClick: handleNodeClick,
            className: "monitoring-clickable-row",
          })}
        />

      </Card>

      {/* ====================================================
          FOOTNOTE
      ==================================================== */}

      <div className="monitoring-page-footnote">

        <Text type="secondary">

          <WarningOutlined />

          {" "}Status labels use the current dashboard thresholds.
          Confirm operational warning levels against approved
          river-level criteria before using them for public alerts.

        </Text>

      </div>

    </div>
  );
};

export default LiveMonitoring;
