import { useMemo, useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Row,
  Space,
  Tag,
  Typography,
  Modal,
} from "antd";

import {
  BellOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

// =========================================================
// MOCK ALERT DATA
// =========================================================

const ALERTS = [
  {
    id: 1,
    severity: "critical",
    location: "Nowshera",
    message: "Critical water level expected.",
    time: "10 min ago",
    timestamp: "11:42 AM",
    expectedCondition:
      "Water level is expected to exceed the critical threshold within the next few hours.",
    action:
      "Move to a safe location immediately and follow official emergency instructions.",
    active: true,
  },

  {
    id: 2,
    severity: "warning",
    location: "Kabul River",
    message: "Water level increasing rapidly.",
    time: "1 hour ago",
    timestamp: "10:52 AM",
    expectedCondition:
      "Water level is continuing to rise and may reach the warning threshold.",
    action:
      "Stay alert, avoid low-lying areas, and prepare to move if conditions worsen.",
    active: true,
  },

  {
    id: 3,
    severity: "watch",
    location: "Station 02",
    message: "Heavy rainfall detected.",
    time: "2 hours ago",
    timestamp: "9:42 AM",
    expectedCondition:
      "Continued rainfall may increase water levels in nearby drainage areas.",
    action:
      "Monitor updates and avoid unnecessary travel through flood-prone areas.",
    active: true,
  },

  {
    id: 4,
    severity: "watch",
    location: "Nowshera",
    message: "Rainfall conditions improving.",
    time: "Yesterday",
    timestamp: "4:20 PM",
    expectedCondition:
      "Flood conditions are currently stable.",
    action:
      "Continue monitoring the situation for further updates.",
    active: false,
  },
];

// =========================================================
// SEVERITY CONFIGURATION
// =========================================================

const severityConfig = {
  critical: {
    label: "Critical",
    color: "red",
    icon: "🔴",
  },

  warning: {
    label: "Warning",
    color: "orange",
    icon: "🟠",
  },

  watch: {
    label: "Watch",
    color: "gold",
    icon: "🟡",
  },

  normal: {
    label: "Normal",
    color: "green",
    icon: "🟢",
  },
};

// =========================================================
// ALERT CARD
// =========================================================

const AlertCard = ({ alert, onViewDetails }) => {
  const config = severityConfig[alert.severity];

  return (
    <Card
      hoverable
      style={{
        borderRadius: 14,
        borderLeft: `5px solid ${
          alert.severity === "critical"
            ? "#ff4d4f"
            : alert.severity === "warning"
            ? "#fa8c16"
            : "#faad14"
        }`,
      }}
    >
      <Flex
        justify="space-between"
        align="flex-start"
        gap={20}
        wrap="wrap"
      >
        {/* =================================================
            ALERT INFORMATION
        ================================================= */}

        <div style={{ flex: 1, minWidth: 250 }}>
          <Space
            size={10}
            wrap
            style={{ marginBottom: 10 }}
          >
            <Tag
              color={config.color}
              style={{
                borderRadius: 20,
                padding: "3px 10px",
                fontWeight: 600,
              }}
            >
              {config.icon} {config.label}
            </Tag>

            {alert.active && (
              <Badge
                status="processing"
                text="Active"
              />
            )}
          </Space>

          <Title
            level={4}
            style={{
              margin: "4px 0 8px",
            }}
          >
            {alert.message}
          </Title>

          <Space
            direction="vertical"
            size={4}
          >
            <Text type="secondary">
              <EnvironmentOutlined />{" "}
              {alert.location}
            </Text>

            <Text type="secondary">
              <ClockCircleOutlined />{" "}
              {alert.timestamp} · {alert.time}
            </Text>
          </Space>
        </div>

        {/* =================================================
            ACTION
        ================================================= */}

        <Button
          type="default"
          icon={<EyeOutlined />}
          onClick={() => onViewDetails(alert)}
        >
          View Details
        </Button>
      </Flex>
    </Card>
  );
};

// =========================================================
// ALERTS PAGE
// =========================================================

const Alerts = () => {
  const [selectedAlert, setSelectedAlert] =
    useState(null);

  const activeAlerts = useMemo(
    () => ALERTS.filter((alert) => alert.active),
    []
  );

  const previousAlerts = useMemo(
    () => ALERTS.filter((alert) => !alert.active),
    []
  );

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={16}
        style={{
          marginBottom: 28,
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              margin: 0,
            }}
          >
            Alerts
          </Title>

          <Text type="secondary">
            Stay informed about flood conditions
            and important safety warnings.
          </Text>
        </div>

        <Badge
          count={activeAlerts.length}
          overflowCount={99}
        >
          <Button
            icon={<BellOutlined />}
            size="large"
          >
            Active Alerts
          </Button>
        </Badge>
      </Flex>

      {/* ===================================================
          ACTIVE ALERTS
      =================================================== */}

      <section style={{ marginBottom: 36 }}>
        <Flex
          align="center"
          gap={10}
          style={{
            marginBottom: 16,
          }}
        >
          <WarningOutlined
            style={{
              fontSize: 20,
              color: "#ff4d4f",
            }}
          />

          <Title
            level={3}
            style={{
              margin: 0,
            }}
          >
            Active Alerts
          </Title>
        </Flex>

        {activeAlerts.length > 0 ? (
          <Flex
            vertical
            gap={14}
          >
            {activeAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onViewDetails={setSelectedAlert}
              />
            ))}
          </Flex>
        ) : (
          <Alert
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            message="No active flood alerts"
            description="There are currently no active warnings for your monitored areas."
          />
        )}
      </section>

      {/* ===================================================
          PREVIOUS ALERTS
      =================================================== */}

      <section>
        <Title
          level={3}
          style={{
            marginBottom: 16,
          }}
        >
          Previous Alerts
        </Title>

        {previousAlerts.length > 0 ? (
          <Flex
            vertical
            gap={14}
          >
            {previousAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onViewDetails={setSelectedAlert}
              />
            ))}
          </Flex>
        ) : (
          <Card>
            <Empty description="No previous alerts" />
          </Card>
        )}
      </section>

      {/* ===================================================
          ALERT DETAILS MODAL
      =================================================== */}

      <Modal
        open={!!selectedAlert}
        onCancel={() => setSelectedAlert(null)}
        footer={null}
        width={600}
        title={
          selectedAlert
            ? `${severityConfig[selectedAlert.severity].icon} ${
                severityConfig[selectedAlert.severity].label
              } Alert`
            : "Alert Details"
        }
      >
        {selectedAlert && (
          <div>
            <Space
              direction="vertical"
              size={18}
              style={{
                width: "100%",
              }}
            >
              {/* LOCATION */}

              <div>
                <Text type="secondary">
                  Location
                </Text>

                <Title
                  level={4}
                  style={{
                    margin: "4px 0 0",
                  }}
                >
                  <EnvironmentOutlined />{" "}
                  {selectedAlert.location}
                </Title>
              </div>

              {/* MESSAGE */}

              <div>
                <Text type="secondary">
                  Alert
                </Text>

                <Paragraph
                  strong
                  style={{
                    marginTop: 4,
                    marginBottom: 0,
                  }}
                >
                  {selectedAlert.message}
                </Paragraph>
              </div>

              {/* EXPECTED CONDITION */}

              <div>
                <Text type="secondary">
                  Expected Condition
                </Text>

                <Paragraph
                  style={{
                    marginTop: 4,
                    marginBottom: 0,
                  }}
                >
                  {selectedAlert.expectedCondition}
                </Paragraph>
              </div>

              {/* ACTION */}

              <Alert
                type={
                  selectedAlert.severity ===
                  "critical"
                    ? "error"
                    : selectedAlert.severity ===
                      "warning"
                    ? "warning"
                    : "info"
                }
                showIcon
                message="What should you do?"
                description={
                  selectedAlert.action
                }
              />

              {/* TIME */}

              <Text type="secondary">
                <ClockCircleOutlined />{" "}
                {selectedAlert.timestamp} ·{" "}
                {selectedAlert.time}
              </Text>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Alerts;