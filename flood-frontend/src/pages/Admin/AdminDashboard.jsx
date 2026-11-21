
import React, { useState } from "react";

import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Tag,
  Badge,
  Progress,
  Table,
  Space,
  Select,
  Tooltip,
  Divider,
} from "antd";

import {
  EnvironmentOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  WarningOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DashboardOutlined,
  WifiOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  RiseOutlined,
  GlobalOutlined,
  FireOutlined,
  ExclamationCircleOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";

import "./styles/AdminDashboard.css";

const { Title, Text } = Typography;

// =====================================================
// SAMPLE DASHBOARD DATA
// Replace with API data when backend integration begins.
// =====================================================

const sensorData = [
  {
    key: "1",
    sensor: "NODE-001",
    station: "Al Aien",
    status: "Online",
    battery: 92,
    signal: -67,
    lastUpdate: "Just now",
  },
  {
    key: "2",
    sensor: "NODE-002",
    station: "Nowshera",
    status: "Online",
    battery: 81,
    signal: -72,
    lastUpdate: "1 min ago",
  },
  {
    key: "3",
    sensor: "NODE-003",
    station: "Kabul River",
    status: "Offline",
    battery: 34,
    signal: null,
    lastUpdate: "12 min ago",
  },
];

const alertsData = [
  {
    id: 1,
    severity: "CRITICAL",
    color: "red",
    title: "Water level threshold exceeded",
    location: "Kabul River Monitoring Area",
    station: "NODE-003",
    time: "2 minutes ago",
  },
  {
    id: 2,
    severity: "WARNING",
    color: "orange",
    title: "Heavy rainfall detected",
    location: "Al Aien Monitoring Area",
    station: "NODE-001",
    time: "8 minutes ago",
  },
];

// =====================================================
// WATER LEVEL CHART
// Lightweight SVG visualization; no chart dependency.
// =====================================================

const WaterLevelChart = () => {
  const points = [
    104, 99, 107, 91, 95, 85, 91, 77,
    83, 70, 75, 64, 69, 56, 62, 49,
  ];

  const chartPoints = points
    .map((value, index) => `${index * 40},${value}`)
    .join(" ");

  const areaPoints = `0,140 ${chartPoints} 600,140`;

  return (
    <div className="water-chart">
      <div className="chart-y-labels">
        <span>35 ft</span>
        <span>30 ft</span>
        <span>25 ft</span>
        <span>20 ft</span>
        <span>15 ft</span>
      </div>

      <div className="chart-main">
        <svg
          viewBox="0 0 600 140"
          preserveAspectRatio="none"
          className="chart-svg"
          role="img"
          aria-label="Illustrative water level trend chart"
        >
          <defs>
            <linearGradient
              id="waterGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#1677ff"
                stopOpacity="0.23"
              />
              <stop
                offset="100%"
                stopColor="#1677ff"
                stopOpacity="0.01"
              />
            </linearGradient>
          </defs>

          {[0, 35, 70, 105, 140].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="600"
              y2={y}
              stroke="#e9edf3"
              strokeDasharray="4 5"
            />
          ))}

          <line
            x1="0"
            y1="49"
            x2="600"
            y2="49"
            stroke="#fa8c16"
            strokeWidth="1.5"
            strokeDasharray="6 5"
          />

          <polygon
            points={areaPoints}
            fill="url(#waterGradient)"
          />

          <polyline
            points={chartPoints}
            fill="none"
            stroke="#1677ff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            cx="600"
            cy="49"
            r="5"
            fill="#1677ff"
            stroke="#ffffff"
            strokeWidth="3"
          />
        </svg>

        <div className="chart-x-labels">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// KPI CARD
// =====================================================

const KpiCard = ({
  title,
  value,
  suffix,
  icon,
  color,
  description,
  trend,
  trendType,
}) => (
  <Card className="dashboard-card kpi-card" bordered={false}>
    <div className="kpi-top">
      <Text className="kpi-title">{title}</Text>

      <div
        className="kpi-icon"
        style={{
          color,
          background: `${color}12`,
        }}
      >
        {icon}
      </div>
    </div>

    <div className="kpi-value">
      <Statistic
        value={value}
        suffix={suffix}
        valueStyle={{
          color: "#172b4d",
          fontSize: 29,
          fontWeight: 700,
        }}
      />
    </div>

    <div className="kpi-footer">
      <Text className="kpi-description">
        {description}
      </Text>

      {trend && (
        <Tag
          bordered={false}
          color={trendType === "up" ? "success" : "error"}
          className="trend-tag"
        >
          {trendType === "up" ? (
            <ArrowUpOutlined />
          ) : (
            <ArrowDownOutlined />
          )}
          {" "}{trend}
        </Tag>
      )}
    </div>
  </Card>
);

// =====================================================
// MAIN ADMIN DASHBOARD
// =====================================================

const AdminDashboard = () => {
  const [selectedStation, setSelectedStation] =
    useState("NODE-001");

  const sensorColumns = [
    {
      title: "SENSOR NODE",
      dataIndex: "sensor",
      key: "sensor",
      render: (value) => (
        <Space size={10}>
          <div className="sensor-icon">
            <CloudServerOutlined />
          </div>
          <Text strong className="sensor-name">
            {value}
          </Text>
        </Space>
      ),
    },
    {
      title: "LOCATION",
      dataIndex: "station",
      key: "station",
      render: (value) => (
        <Space size={6}>
          <EnvironmentOutlined className="muted-icon" />
          <Text>{value}</Text>
        </Space>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === "Online" ? "success" : "error"}
          text={
            <span className="status-text">
              {status}
            </span>
          }
        />
      ),
    },
    {
      title: "BATTERY",
      dataIndex: "battery",
      key: "battery",
      render: (value) => (
        <div className="battery-cell">
          <Progress
            percent={value}
            showInfo={false}
            size="small"
            strokeColor={
              value < 30
                ? "#ff4d4f"
                : value < 50
                ? "#faad14"
                : "#52c41a"
            }
            trailColor="#edf0f5"
          />
          <Text className="battery-value">
            {value}%
          </Text>
        </div>
      ),
    },
    {
      title: "SIGNAL",
      dataIndex: "signal",
      key: "signal",
      render: (value) =>
        value === null ? (
          <Text type="secondary">Unavailable</Text>
        ) : (
          <Space size={5}>
            <WifiOutlined className="signal-icon" />
            <Text>{value} dBm</Text>
          </Space>
        ),
    },
    {
      title: "LAST UPDATE",
      dataIndex: "lastUpdate",
      key: "lastUpdate",
      render: (value) => (
        <Text type="secondary" className="last-update">
          {value}
        </Text>
      ),
    },
  ];

  return (
    <div className="admin-dashboard">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="dashboard-header">
        
        </div>

        <div className="header-actions">
          <Tag
            color="processing"
            bordered={false}
            className="monitoring-tag"
          >
            <span className="live-dot" />
            Monitoring
          </Tag>

          <Tooltip title="Refresh dashboard data">
            <button
              type="button"
              className="refresh-button"
              onClick={() => window.location.reload()}
              aria-label="Refresh dashboard"
            >
              <ReloadOutlined />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <Row gutter={[18, 18]} className="kpi-section">

        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="Monitoring Nodes"
            value={3}
            icon={<EnvironmentOutlined />}
            color="#1677ff"
            description="Registered monitoring nodes"
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="Online Nodes"
            value={2}
            icon={<CheckCircleOutlined />}
            color="#16a36a"
            description="1 node currently offline"
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="Active Alerts"
            value={2}
            icon={<AlertOutlined />}
            color="#e85932"
            description="Require administrative attention"
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="System Risk"
            value="HIGH"
            icon={<WarningOutlined />}
            color="#d9363e"
            description="Elevated flood-risk condition"
          />
        </Col>

      </Row>

      {/* =================================================
          MAP AND RISK SECTION
      ================================================= */}

      <Row gutter={[18, 18]} className="main-section">

        <Col xs={24} xl={16}>
          <Card
            className="dashboard-card map-card"
            bordered={false}
            title={
              <div className="section-heading">
                <div className="section-icon blue">
                  <GlobalOutlined />
                </div>
                <div>
                  <Text strong className="section-title">
                    Geographic Monitoring
                  </Text>
                  <Text className="section-subtitle">
                    Monitoring network overview
                  </Text>
                </div>
              </div>
            }
            extra={
              <Tag color="success" bordered={false}>
                <span className="live-dot" />
                LIVE
              </Tag>
            }
          >
            <div className="map-placeholder">
              <div className="map-grid" />

              <div className="map-center-content">
                <div className="map-main-icon">
                  <EnvironmentOutlined />
                </div>

                <Title level={4}>
                  Flood Monitoring Map
                </Title>

                <Text type="secondary">
                  GIS-based monitoring and flood-zone
                  visualization will be integrated here.
                </Text>

                <Space wrap className="map-locations">
                  <Tag color="blue">Al Aien</Tag>
                  <Tag color="blue">Nowshera</Tag>
                  <Tag color="blue">Kabul River</Tag>
                </Space>
              </div>

              <div className="map-footer">
                <Text type="secondary">
                  <EnvironmentOutlined /> Kabul River Basin
                </Text>
                <Text type="secondary">
                  3 Registered Nodes
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card
            className="dashboard-card risk-card"
            bordered={false}
            title={
              <div className="section-heading">
                <div className="section-icon red">
                  <FireOutlined />
                </div>
                <div>
                  <Text strong className="section-title">
                    Flood Risk Assessment
                  </Text>
                  <Text className="section-subtitle">
                    Current risk evaluation
                  </Text>
                </div>
              </div>
            }
          >
            <div className="risk-content">
              <Progress
                type="dashboard"
                percent={78}
                size={175}
                strokeWidth={10}
                strokeColor="#e5484d"
                trailColor="#f0f1f4"
                format={() => (
                  <div className="risk-progress-label">
                    <Title level={2}>78</Title>
                    <Text type="secondary">Risk score</Text>
                  </div>
                )}
              />

              <Tag
                color="error"
                bordered={false}
                className="risk-tag"
              >
                <WarningOutlined /> HIGH RISK
              </Tag>

              <Title level={4} className="risk-heading">
                Elevated Flood Risk
              </Title>

              <Text className="risk-description">
                Current conditions indicate an elevated
                flood-risk level. Continuous monitoring
                is recommended.
              </Text>

              <Divider />

              <div className="risk-indicators">
                <div>
                  <Text type="secondary">Risk status</Text>
                  <Text strong>High</Text>
                </div>

                <div>
                  <Text type="secondary">Monitoring</Text>
                  <Text strong>Active</Text>
                </div>

                <div>
                  <Text type="secondary">Alert status</Text>
                  <Text strong>2 Active</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

      </Row>

      {/* =================================================
          WATER LEVEL FORECAST
      ================================================= */}

      <Card
        className="dashboard-card chart-card"
        bordered={false}
        title={
          <div className="section-heading">
            <div className="section-icon blue">
              <RiseOutlined />
            </div>
            <div>
              <Text strong className="section-title">
                Water Level & Forecast
              </Text>
              <Text className="section-subtitle">
                Water-level monitoring and trend visualization
              </Text>
            </div>
          </div>
        }
        extra={
          <Select
            value={selectedStation}
            onChange={setSelectedStation}
            className="station-select"
            options={[
              { value: "NODE-001", label: "Al Aien" },
              { value: "NODE-002", label: "Nowshera" },
              { value: "NODE-003", label: "Kabul River" },
            ]}
          />
        }
      >
        <Row gutter={[24, 16]} className="chart-summary">

          <Col xs={12} md={6}>
            <Text className="metric-label">
              Current Water Level
            </Text>
            <Title level={3} className="metric-value">
              15.6 <Text className="metric-unit">ft</Text>
            </Title>
            <Text type="secondary">
              <ArrowUpOutlined className="positive-icon" />
              {" "}Illustrative sample
            </Text>
          </Col>

          <Col xs={12} md={6}>
            <Text className="metric-label">
              Medium Threshold
            </Text>
            <Title level={3} className="metric-value">
              25 <Text className="metric-unit">ft</Text>
            </Title>
            <Text type="secondary">Watch level</Text>
          </Col>

          <Col xs={12} md={6}>
            <Text className="metric-label">
              High Threshold
            </Text>
            <Title level={3} className="metric-value">
              30 <Text className="metric-unit">ft</Text>
            </Title>
            <Text type="secondary">Warning level</Text>
          </Col>

          <Col xs={12} md={6}>
            <Text className="metric-label">
              Forecast Horizon
            </Text>
            <Title level={3} className="metric-value">
              6 <Text className="metric-unit">hrs</Text>
            </Title>
            <Text type="secondary">Planned prediction</Text>
          </Col>

        </Row>

        <Divider />

        <div className="chart-legend">
          <span>
            <i className="legend-dot blue-dot" />
            Water level trend
          </span>

          <span>
            <i className="legend-dot orange-dot" />
            Illustrative threshold
          </span>
        </div>

        <WaterLevelChart />

        <div className="chart-note">
          <Text type="secondary">
            <ClockCircleOutlined /> Sample visualization.
            Connect the historical and forecast API data
            before using this chart operationally.
          </Text>
        </div>
      </Card>

      {/* =================================================
          SENSOR STATUS TABLE
      ================================================= */}

      <Card
        className="dashboard-card sensor-card"
        bordered={false}
        title={
          <div className="section-heading">
            <div className="section-icon green">
              <ThunderboltOutlined />
            </div>
            <div>
              <Text strong className="section-title">
                Sensor Network Status
              </Text>
              <Text className="section-subtitle">
                Device connectivity and hardware health
              </Text>
            </div>
          </div>
        }
        extra={
          <Tag color="processing" bordered={false}>
            3 Nodes
          </Tag>
        }
      >
        <Table
          columns={sensorColumns}
          dataSource={sensorData}
          pagination={false}
          scroll={{ x: 850 }}
          size="middle"
          className="sensor-table"
        />
      </Card>

      {/* =================================================
          RECENT ALERTS
      ================================================= */}

      <Card
        className="dashboard-card alerts-card"
        bordered={false}
        title={
          <div className="section-heading">
            <div className="section-icon orange">
              <AlertOutlined />
            </div>
            <div>
              <Text strong className="section-title">
                Recent System Alerts
              </Text>
              <Text className="section-subtitle">
                Latest flood and monitoring notifications
              </Text>
            </div>
          </div>
        }
        extra={
          <Tag color="error" bordered={false}>
            2 Active
          </Tag>
        }
      >
        <div className="alerts-list">
          {alertsData.map((alert) => (
            <div
              className="alert-item"
              key={alert.id}
            >
              <div
                className={`alert-indicator ${alert.color}`}
              >
                <ExclamationCircleOutlined />
              </div>

              <div className="alert-details">
                <div className="alert-title-row">
                  <Text strong className="alert-title">
                    {alert.title}
                  </Text>

                  <Tag
                    color={alert.color}
                    bordered={false}
                  >
                    {alert.severity}
                  </Tag>
                </div>

                <Text className="alert-location">
                  <EnvironmentOutlined /> {alert.location}
                  {" "} · {alert.station}
                </Text>

                <Text className="alert-time">
                  <ClockCircleOutlined /> {alert.time}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="dashboard-footer">
        <Text type="secondary">
          Flood Forecasting & Monitoring System
        </Text>

        <Text type="secondary">
          Administrative Overview
        </Text>
      </div>

    </div>
  );
};

export default AdminDashboard;
