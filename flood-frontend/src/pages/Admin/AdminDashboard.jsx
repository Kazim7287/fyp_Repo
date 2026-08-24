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
} from "antd";

import {
  EnvironmentOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  WarningOutlined,
  CloudOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const sensorColumns = [
    {
      title: "Sensor",
      dataIndex: "sensor",
      key: "sensor",
    },
    {
      title: "Station",
      dataIndex: "station",
      key: "station",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "Online" ? (
          <Badge status="success" text="Online" />
        ) : (
          <Badge status="error" text="Offline" />
        ),
    },
    {
      title: "Battery",
      dataIndex: "battery",
      key: "battery",
      render: (value) => (
        <Progress
          percent={value}
          size="small"
          status={value < 30 ? "exception" : "normal"}
        />
      ),
    },
    {
      title: "Signal",
      dataIndex: "signal",
      key: "signal",
    },
  ];

  const sensorData = [
    {
      key: "1",
      sensor: "NODE-001",
      station: "ST-001",
      status: "Online",
      battery: 92,
      signal: "-67 dBm",
    },
    {
      key: "2",
      sensor: "NODE-002",
      station: "ST-002",
      status: "Online",
      battery: 81,
      signal: "-72 dBm",
    },
    {
      key: "3",
      sensor: "NODE-003",
      station: "ST-003",
      status: "Offline",
      battery: 34,
      signal: "—",
    },
  ];

  return (
    <Space
      direction="vertical"
      size="large"
      style={{
        width: "100%",
      }}
    >
      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Stations"
              value={3}
              prefix={<EnvironmentOutlined />}
            />

            <Text type="secondary">
              Monitoring stations
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Online"
              value={3}
              prefix={<CheckCircleOutlined />}
              valueStyle={{
                color: "#52c41a",
              }}
            />

            <Text type="secondary">
              Active stations
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Alerts"
              value={2}
              prefix={<AlertOutlined />}
              valueStyle={{
                color: "#fa541c",
              }}
            />

            <Text type="secondary">
              Require attention
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="System Risk"
              value="HIGH"
              prefix={<WarningOutlined />}
              valueStyle={{
                color: "#fa541c",
              }}
            />

            <Text type="secondary">
              Current risk level
            </Text>
          </Card>
        </Col>
      </Row>

      {/* =====================================================
          MAP + RISK
      ===================================================== */}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Live Flood Monitoring"
            extra={
              <Tag color="green">
                LIVE
              </Tag>
            }
          >
            <div
              style={{
                height: 400,
                background: "#eef2f7",
                borderRadius: 8,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                flexDirection: "column",

                padding: 20,

                textAlign: "center",
              }}
            >
              <EnvironmentOutlined
                style={{
                  fontSize: 50,
                  color: "#1677ff",
                }}
              />

              <Title
                level={4}
                style={{
                  marginTop: 15,
                }}
              >
                GIS Monitoring Map
              </Title>

              <Text type="secondary">
                Live station and flood-zone
                visualization will be integrated here.
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="System Risk"
            extra={
              <Tag color="red">
                HIGH
              </Tag>
            }
          >
            <div
              style={{
                textAlign: "center",
              }}
            >
              <Progress
                type="dashboard"
                percent={78}
                status="exception"
              />

              <Title level={3}>
                High Risk
              </Title>

              <Text type="secondary">
                Current system risk score
              </Text>

              <div
                style={{
                  marginTop: 20,
                }}
              >
                <Badge
                  status="warning"
                  text="Elevated flood conditions"
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* =====================================================
          WATER LEVEL & FORECAST
      ===================================================== */}

      <Card
        title="Water Level & Forecast"
        extra={
          <Select
            defaultValue="ST-001"
            style={{
              width: 160,
              maxWidth: "100%",
            }}
            options={[
              {
                value: "ST-001",
                label: "Station ST-001",
              },
              {
                value: "ST-002",
                label: "Station ST-002",
              },
              {
                value: "ST-003",
                label: "Station ST-003",
              },
            ]}
          />
        }
      >
        <div
          style={{
            height: 300,

            background: "#fafafa",

            borderRadius: 8,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            padding: 20,

            textAlign: "center",
          }}
        >
          <Space
            direction="vertical"
            align="center"
          >
            <CloudOutlined
              style={{
                fontSize: 45,
                color: "#1677ff",
              }}
            />

            <Text strong>
              Water Level / Forecast Chart
            </Text>

            <Text type="secondary">
              Historical and AI forecast data
              will appear here.
            </Text>
          </Space>
        </div>
      </Card>

      {/* =====================================================
          SENSOR STATUS
      ===================================================== */}

      <Card title="Sensor Status">
        <Table
          columns={sensorColumns}
          dataSource={sensorData}
          pagination={false}
          scroll={{
            x: 600,
          }}
        />
      </Card>

      {/* =====================================================
          RECENT ALERTS
      ===================================================== */}

      <Card
        title="Recent Alerts"
        extra={
          <Tag>
            2 Active
          </Tag>
        }
      >
        <Space
          direction="vertical"
          style={{
            width: "100%",
          }}
          size="middle"
        >
          <Card
            size="small"
            type="inner"
          >
            <Space align="start">
              <Tag color="red">
                CRITICAL
              </Tag>

              <div>
                <Text strong>
                  Water level threshold exceeded
                </Text>

                <br />

                <Text type="secondary">
                  Station ST-003 • 2 minutes ago
                </Text>
              </div>
            </Space>
          </Card>

          <Card
            size="small"
            type="inner"
          >
            <Space align="start">
              <Tag color="orange">
                HIGH
              </Tag>

              <div>
                <Text strong>
                  Heavy rainfall detected
                </Text>

                <br />

                <Text type="secondary">
                  Station ST-001 • 8 minutes ago
                </Text>
              </div>
            </Space>
          </Card>
        </Space>
      </Card>
    </Space>
  );
};

export default AdminDashboard;