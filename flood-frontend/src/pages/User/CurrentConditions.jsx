import {
  Card,
  Col,
  Row,
  Typography,
  Tag,
  Space,
  Divider,
  Progress,
} from "antd";

import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  FireOutlined,
  RiseOutlined,
  CloudOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// =========================================================
// CURRENT CONDITIONS
// =========================================================

const CurrentConditions = () => {
  // =======================================================
  // TEMPORARY MOCK DATA
  // Replace this later with backend/API data.
  // =======================================================

  const conditions = {
    location: "Nowshera",
    station: "NWS-01",
    updatedAt: "11:42 AM",

    risk: {
      level: "WATCH",
      color: "gold",
      emoji: "🟡",
      percentage: 48,
      description:
        "Water levels are elevated. Continue monitoring the situation.",
    },

    waterLevel: {
      value: 14.8,
      unit: "m",
      trend: "Rising",
      status: "Elevated",
    },

    rainfall: {
      value: 32,
      unit: "mm",
      status: "Heavy",
    },

    flowRate: {
      value: 3.8,
      unit: "m³/s",
      status: "Elevated",
    },

    soilMoisture: {
      value: 68,
      unit: "%",
      status: "High",
    },

    temperature: {
      value: 28.6,
      unit: "°C",
      status: "Normal",
    },

    humidity: {
      value: 71,
      unit: "%",
      status: "High",
    },
  };

  // =========================================================
  // REUSABLE MEASUREMENT CARD
  // =========================================================

  const MeasurementCard = ({
    title,
    value,
    unit,
    status,
    icon,
    iconColor,
  }) => {
    return (
      <Card
        variant="borderless"
        style={{
          height: "100%",
          borderRadius: 14,
          boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
        }}
      >
        <Space
          align="start"
          style={{
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          {/* VALUE */}

          <div>
            <Text
              type="secondary"
              style={{
                fontSize: 13,
              }}
            >
              {title}
            </Text>

            <div
              style={{
                marginTop: 8,
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 650,
                  color: "#1f1f1f",
                }}
              >
                {value}
              </span>

              <span
                style={{
                  marginLeft: 5,
                  color: "#8c8c8c",
                  fontSize: 14,
                }}
              >
                {unit}
              </span>
            </div>

            <Tag
              style={{
                marginTop: 10,
                borderRadius: 6,
              }}
            >
              {status}
            </Tag>
          </div>

          {/* ICON */}

          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,

              background: `${iconColor}15`,
              color: iconColor,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              fontSize: 21,
            }}
          >
            {icon}
          </div>
        </Space>
      </Card>
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      style={{
        padding: 24,
        background: "#f5f7fa",
        minHeight: "100%",
      }}
    >
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div
        style={{
          marginBottom: 24,
        }}
      >
        <Title
          level={2}
          style={{
            marginBottom: 5,
          }}
        >
          Current Conditions
        </Title>

        <Text type="secondary">
          View the latest measured flood and environmental conditions.
        </Text>
      </div>

      {/* =====================================================
          LOCATION / LAST UPDATED
      ===================================================== */}

      <Card
        variant="borderless"
        style={{
          borderRadius: 14,
          marginBottom: 20,
          boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
        }}
      >
        <Row
          gutter={[20, 16]}
          align="middle"
          justify="space-between"
        >
          {/* LOCATION */}

          <Col>
            <Space size={12}>
              <EnvironmentOutlined
                style={{
                  fontSize: 22,
                  color: "#1677ff",
                }}
              />

              <div>
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    fontSize: 12,
                  }}
                >
                  Monitoring Location
                </Text>

                <Text
                  strong
                  style={{
                    fontSize: 17,
                  }}
                >
                  {conditions.location}
                </Text>

                <Text
                  type="secondary"
                  style={{
                    marginLeft: 8,
                  }}
                >
                  • {conditions.station}
                </Text>
              </div>
            </Space>
          </Col>

          {/* LAST UPDATED */}

          <Col>
            <Space>
              <ClockCircleOutlined
                style={{
                  color: "#8c8c8c",
                }}
              />

              <Text type="secondary">
                Last updated {conditions.updatedAt}
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* =====================================================
          CURRENT FLOOD RISK
      ===================================================== */}

      <Card
        variant="borderless"
        style={{
          borderRadius: 14,
          marginBottom: 20,
          boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
          borderLeft: "5px solid #faad14",
        }}
      >
        <Row
          gutter={[24, 20]}
          align="middle"
        >
          {/* RISK LEVEL */}

          <Col xs={24} md={7}>
            <Text
              type="secondary"
              style={{
                display: "block",
                fontSize: 13,
              }}
            >
              CURRENT FLOOD RISK
            </Text>

            <div
              style={{
                marginTop: 7,
                fontSize: 30,
                fontWeight: 700,
                color: "#d48806",
              }}
            >
              {conditions.risk.emoji} {conditions.risk.level}
            </div>
          </Col>

          {/* DESCRIPTION */}

          <Col xs={24} md={11}>
            <Text
              style={{
                fontSize: 15,
              }}
            >
              {conditions.risk.description}
            </Text>

            <div
              style={{
                marginTop: 14,
              }}
            >
              <Space>
                <ArrowUpOutlined
                  style={{
                    color: "#d48806",
                  }}
                />

                <Text strong>
                  Water level is currently rising.
                </Text>
              </Space>
            </div>
          </Col>

          {/* RISK PERCENTAGE */}

          <Col xs={24} md={6}>
            <div
              style={{
                textAlign: "center",
              }}
            >
              <Text type="secondary">
                Current Risk Index
              </Text>

              <Progress
                type="circle"
                percent={conditions.risk.percentage}
                size={85}
                strokeWidth={8}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* =====================================================
          HYDROLOGICAL CONDITIONS
      ===================================================== */}

      <Title
        level={4}
        style={{
          marginBottom: 14,
        }}
      >
        Hydrological Conditions
      </Title>

      <Row
        gutter={[16, 16]}
        style={{
          marginBottom: 26,
        }}
      >
        {/* WATER LEVEL */}

        <Col xs={24} sm={12} lg={8}>
          <MeasurementCard
            title="Water Level"
            value={conditions.waterLevel.value}
            unit={conditions.waterLevel.unit}
            status={conditions.waterLevel.status}
            icon={<RiseOutlined />}
            iconColor="#1677ff"
          />
        </Col>

        {/* RAINFALL */}

        <Col xs={24} sm={12} lg={8}>
          <MeasurementCard
            title="Rainfall"
            value={conditions.rainfall.value}
            unit={conditions.rainfall.unit}
            status={conditions.rainfall.status}
            icon={<CloudOutlined />}
            iconColor="#4096ff"
          />
        </Col>

        {/* FLOW RATE */}

        <Col xs={24} sm={12} lg={8}>
          <MeasurementCard
            title="Flow Rate"
            value={conditions.flowRate.value}
            unit={conditions.flowRate.unit}
            status={conditions.flowRate.status}
            icon={<DashboardOutlined />}
            iconColor="#722ed1"
          />
        </Col>
      </Row>

      {/* =====================================================
          ENVIRONMENTAL CONDITIONS
      ===================================================== */}

      <Title
        level={4}
        style={{
          marginBottom: 14,
        }}
      >
        Environmental Conditions
      </Title>

      <Row gutter={[16, 16]}>
        {/* SOIL MOISTURE */}

        <Col xs={24} sm={12} lg={8}>
          <MeasurementCard
            title="Soil Moisture"
            value={conditions.soilMoisture.value}
            unit={conditions.soilMoisture.unit}
            status={conditions.soilMoisture.status}
            icon={<ExperimentOutlined />}
            iconColor="#52c41a"
          />
        </Col>

        {/* TEMPERATURE */}

        <Col xs={24} sm={12} lg={8}>
          <MeasurementCard
            title="Temperature"
            value={conditions.temperature.value}
            unit={conditions.temperature.unit}
            status={conditions.temperature.status}
            icon={<FireOutlined />}
            iconColor="#fa541c"
          />
        </Col>

        {/* HUMIDITY */}

        <Col xs={24} sm={12} lg={8}>
          <MeasurementCard
            title="Humidity"
            value={conditions.humidity.value}
            unit={conditions.humidity.unit}
            status={conditions.humidity.status}
            icon={<ThunderboltOutlined />}
            iconColor="#13c2c2"
          />
        </Col>
      </Row>

      {/* =====================================================
          CURRENT SITUATION
      ===================================================== */}

      <Card
        variant="borderless"
        style={{
          marginTop: 26,
          borderRadius: 14,
          boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
        }}
      >
        <Space
          align="center"
          size={10}
        >
          <SafetyCertificateOutlined
            style={{
              fontSize: 20,
              color: "#1677ff",
            }}
          />

          <Title
            level={4}
            style={{
              margin: 0,
            }}
          >
            Current Situation
          </Title>
        </Space>

        <Divider />

        <Text
          style={{
            fontSize: 15,
            lineHeight: 1.8,
          }}
        >
          Current measurements indicate elevated water levels and significant
          rainfall around {conditions.location}. The monitoring system
          currently classifies the area as{" "}
          <strong>{conditions.risk.level}</strong>. The water level is
          rising, so users should continue monitoring flood alerts and
          official emergency information.
        </Text>
      </Card>

      {/* =====================================================
          DATA SOURCE INFORMATION
      ===================================================== */}

      <Card
        variant="borderless"
        style={{
          marginTop: 16,
          borderRadius: 14,
          boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
        }}
      >
        <Space
          direction="vertical"
          size={4}
        >
          <Text strong>
            Monitoring Information
          </Text>

          <Text type="secondary">
            Station: {conditions.station}
          </Text>

          <Text type="secondary">
            Location: {conditions.location}
          </Text>

          <Text type="secondary">
            Last measurement: {conditions.updatedAt}
          </Text>

          <Text
            type="secondary"
            style={{
              fontSize: 12,
            }}
          >
            Data shown here represents the latest measured conditions.
            Forecast predictions are displayed separately on the Forecast
            page.
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default CurrentConditions;