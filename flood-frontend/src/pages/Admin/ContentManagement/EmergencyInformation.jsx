import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Alert,
  Card,
  Col,
  Empty,
  List,
  Row,
  Spin,
  Tag,
  Typography,
} from "antd";

import {
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import {
  fetchEmergencyInformation,
  selectEmergencyInformation,
  selectEmergencyLoading,
  selectEmergencyError,
} from "../store/slices/emergencySlice";

const { Title, Text, Paragraph } = Typography;

// =========================================================
// STATUS CONFIGURATION
// =========================================================

const STATUS_CONFIG = {
  NORMAL: {
    label: "Normal",
    color: "green",
    icon: <SafetyOutlined />,
  },

  WATCH: {
    label: "Watch",
    color: "gold",
    icon: <WarningOutlined />,
  },

  WARNING: {
    label: "Warning",
    color: "orange",
    icon: <ExclamationCircleOutlined />,
  },

  CRITICAL: {
    label: "Critical",
    color: "red",
    icon: <ExclamationCircleOutlined />,
  },
};

// =========================================================
// FORMAT DATE
// =========================================================

const formatUpdatedAt = (dateValue) => {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// =========================================================
// GET STATUS CONFIG
// =========================================================

const getStatusConfig = (status) => {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      color: "default",
      icon: <WarningOutlined />,
    }
  );
};

// =========================================================
// MAIN COMPONENT
// =========================================================

const EmergencyInfo = () => {
  const dispatch = useDispatch();

  // =======================================================
  // REDUX STATE
  // =======================================================

  const emergencyInformation = useSelector(
    selectEmergencyInformation
  );

  const loading = useSelector(
    selectEmergencyLoading
  );

  const error = useSelector(
    selectEmergencyError
  );

  // =======================================================
  // FETCH EMERGENCY INFORMATION
  // =======================================================

  useEffect(() => {
    dispatch(
      fetchEmergencyInformation({
        node_id: 2,
      })
    );
  }, [dispatch]);

  // =======================================================
  // CURRENT EMERGENCY
  // =======================================================

  const emergency =
    emergencyInformation?.[0] || null;

  // =======================================================
  // LOADING STATE
  // =======================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // =======================================================
  // ERROR STATE
  // =======================================================

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          type="error"
          showIcon
          message="Unable to load emergency information"
          description={error}
        />
      </div>
    );
  }

  // =======================================================
  // EMPTY STATE
  // =======================================================

  if (!emergency) {
    return (
      <div style={{ padding: "24px" }}>
        <Empty
          description="No emergency information is currently available."
        />
      </div>
    );
  }

  // =======================================================
  // STATUS
  // =======================================================

  const statusConfig =
    getStatusConfig(emergency.status);

  // =======================================================
  // SAFE LOCATIONS
  // =======================================================

  const safeLocations = Array.isArray(
    emergency.safe_locations
  )
    ? emergency.safe_locations
    : [];

  // =======================================================
  // NODE / LOCATION INFORMATION
  // =======================================================

  const locationName =
    emergency.location_name ||
    emergency.node_name ||
    "Nowshera";

  const nodeName =
    emergency.node_name ||
    "Nowshera";

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div style={{ marginBottom: "24px" }}>
        <Title
          level={2}
          style={{ marginBottom: "8px" }}
        >
          Emergency Information
        </Title>

        <Text type="secondary">
          Current flood emergency information,
          evacuation guidance, and safety instructions.
        </Text>
      </div>

      {/* ===================================================
          ACTIVE EMERGENCY ALERT
      =================================================== */}

      {emergency.active_emergency && (
        <Alert
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message="Active Emergency"
          description="An emergency situation is currently active. Follow official instructions and evacuation guidance."
          style={{
            marginBottom: "24px",
          }}
        />
      )}

      {/* ===================================================
          CURRENT EMERGENCY STATUS
      =================================================== */}

      <Card
        title="Current Emergency Status"
        style={{
          marginBottom: "24px",
        }}
      >
        <Row gutter={[24, 24]}>
          {/* STATUS */}

          <Col
            xs={24}
            sm={12}
            md={8}
          >
            <div>
              <Text
                type="secondary"
                style={{
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Status
              </Text>

              <Tag
                color={statusConfig.color}
                icon={statusConfig.icon}
                style={{
                  fontSize: "15px",
                  padding: "6px 12px",
                }}
              >
                {statusConfig.label}
              </Tag>
            </div>
          </Col>

          {/* LOCATION */}

          <Col
            xs={24}
            sm={12}
            md={8}
          >
            <div>
              <Text
                type="secondary"
                style={{
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Monitoring Area
              </Text>

              <Text strong>
                <EnvironmentOutlined
                  style={{
                    marginRight: "6px",
                  }}
                />

                {locationName}
              </Text>
            </div>
          </Col>

          {/* UPDATED */}

          <Col
            xs={24}
            sm={12}
            md={8}
          >
            <div>
              <Text
                type="secondary"
                style={{
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Last Updated
              </Text>

              <Text strong>
                {formatUpdatedAt(
                  emergency.updated_at
                )}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ===================================================
          MONITORING AREA
      =================================================== */}

      <Card
        title="Monitoring Area"
        style={{
          marginBottom: "24px",
        }}
      >
        <Row gutter={[24, 24]}>
          <Col
            xs={24}
            md={12}
          >
            <Text type="secondary">
              Monitoring Node
            </Text>

            <div style={{ marginTop: "6px" }}>
              <Text strong>
                {nodeName}
              </Text>
            </div>
          </Col>

          <Col
            xs={24}
            md={6}
          >
            <Text type="secondary">
              Device ID
            </Text>

            <div style={{ marginTop: "6px" }}>
              <Text strong>
                {emergency.device_id ||
                  "Not available"}
              </Text>
            </div>
          </Col>

          <Col
            xs={24}
            md={6}
          >
            <Text type="secondary">
              Node ID
            </Text>

            <div style={{ marginTop: "6px" }}>
              <Text strong>
                {emergency.node_id}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ===================================================
          CURRENT SITUATION
      =================================================== */}

      <Card
        title="Current Situation"
        style={{
          marginBottom: "24px",
        }}
      >
        <Paragraph
          style={{
            marginBottom: "16px",
          }}
        >
          <Text strong>
            Affected Area:
          </Text>{" "}
          {emergency.affected_area ||
            "No affected area information available."}
        </Paragraph>

        <Paragraph
          style={{
            marginBottom: 0,
          }}
        >
          <Text strong>
            Situation:
          </Text>{" "}
          {emergency.message ||
            "No current situation message available."}
        </Paragraph>
      </Card>

      {/* ===================================================
          WHAT YOU SHOULD DO
      =================================================== */}

      <Card
        title="What You Should Do"
        style={{
          marginBottom: "24px",
        }}
      >
        <List
          dataSource={[
            "Stay alert and monitor official flood warnings.",
            "Avoid travelling through flooded roads or river channels.",
            "Keep important documents, medicines, and emergency supplies ready.",
            "Follow instructions from local authorities and emergency services.",
            "Move to safer or higher ground if conditions deteriorate.",
          ]}
          renderItem={(item) => (
            <List.Item>
              <Text>
                • {item}
              </Text>
            </List.Item>
          )}
        />
      </Card>

      {/* ===================================================
          EVACUATION INFORMATION
      =================================================== */}

      <Card
        title="Evacuation Information"
        style={{
          marginBottom: "24px",
        }}
      >
        <Alert
          type={
            emergency.evacuation_required
              ? "error"
              : "success"
          }
          showIcon
          message={
            emergency.evacuation_required
              ? "Evacuation Required"
              : "Evacuation Not Currently Required"
          }
          description={
            emergency.evacuation_required
              ? "Residents in affected areas should follow official evacuation instructions and move to designated safe locations."
              : "There is currently no evacuation requirement for the monitored area. Continue monitoring official instructions."
          }
        />

        {/* SAFE LOCATIONS */}

        {safeLocations.length > 0 && (
          <div
            style={{
              marginTop: "24px",
            }}
          >
            <Text strong>
              Recommended Safe Locations
            </Text>

            <List
              size="small"
              style={{
                marginTop: "12px",
              }}
              dataSource={safeLocations}
              renderItem={(location) => (
                <List.Item>
                  <SafetyOutlined
                    style={{
                      marginRight: "10px",
                    }}
                  />

                  {location}
                </List.Item>
              )}
            />
          </div>
        )}
      </Card>

      {/* ===================================================
          EMERGENCY CONTACTS
      =================================================== */}

      <Card title="Emergency Contacts">
        <Row gutter={[24, 24]}>
          <Col
            xs={24}
            sm={12}
            md={8}
          >
            <Text type="secondary">
              Rescue Service
            </Text>

            <div style={{ marginTop: "6px" }}>
              <Text strong>
                Rescue 1122
              </Text>
            </div>
          </Col>

          <Col
            xs={24}
            sm={12}
            md={8}
          >
            <Text type="secondary">
              Police
            </Text>

            <div style={{ marginTop: "6px" }}>
              <Text strong>
                15
              </Text>
            </div>
          </Col>

          <Col
            xs={24}
            sm={12}
            md={8}
          >
            <Text type="secondary">
              Emergency Medical Assistance
            </Text>

            <div style={{ marginTop: "6px" }}>
              <Text strong>
                1122
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EmergencyInfo;