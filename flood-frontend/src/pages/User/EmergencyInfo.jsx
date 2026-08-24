
import {
  Alert,
  Card,
  Col,
  Row,
  Typography,
  Tag,
  Space,
  Divider,
  Button,
} from "antd";

import {
  WarningOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  CarOutlined,
  PhoneOutlined,
  HomeOutlined,
  ArrowUpOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const EmergencyInfo = () => {
  // =========================================================
  // TEMPORARY DATA
  // Replace with API data later.
  // =========================================================

  const emergency = {
    status: "WATCH",
    location: "Nowshera",
    affectedArea: "Low-lying areas near the Kabul River",
    updatedAt: "11:42 AM",

    activeEmergency: false,

    message:
      "Water levels are elevated. Residents in low-lying areas should remain alert and monitor official instructions.",

    evacuationRequired: false,

    safeLocations: [
      "Designated community evacuation centers",
      "Higher ground away from river channels",
      "Officially designated shelters",
    ],
  };

  return (
    <div
      style={{
        minHeight: "100%",
        padding: 24,
        background: "#f5f7fa",
      }}
    >
      {/* =====================================================
          HEADER
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
          Emergency Information
        </Title>

        <Text type="secondary">
          Important information and instructions during flood emergencies.
        </Text>
      </div>

      {/* =====================================================
          EMERGENCY STATUS
      ===================================================== */}

      <Alert
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        message={
          <span
            style={{
              fontWeight: 650,
              fontSize: 16,
            }}
          >
            Current Emergency Status: WATCH
          </span>
        }
        description={
          <div
            style={{
              marginTop: 5,
            }}
          >
            <Text>
              No immediate evacuation order is currently active. Stay alert
              and monitor official updates.
            </Text>
          </div>
        }
        style={{
          borderRadius: 12,
          marginBottom: 20,
        }}
      />

      {/* =====================================================
          LOCATION INFORMATION
      ===================================================== */}

      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          marginBottom: 20,
          boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
        }}
      >
        <Row
          gutter={[24, 16]}
          align="middle"
        >
          <Col xs={24} md={12}>
            <Space align="start">
              <EnvironmentOutlined
                style={{
                  fontSize: 24,
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
                  MONITORING AREA
                </Text>

                <Text
                  strong
                  style={{
                    fontSize: 18,
                  }}
                >
                  {emergency.location}
                </Text>

                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    marginTop: 4,
                  }}
                >
                  {emergency.affectedArea}
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Space>
              <ClockCircleOutlined
                style={{
                  color: "#8c8c8c",
                }}
              />

              <Text type="secondary">
                Updated {emergency.updatedAt}
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* =====================================================
          ACTIVE EMERGENCY
      ===================================================== */}

      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          marginBottom: 20,
          boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
        }}
      >
        <Title
          level={4}
          style={{
            marginTop: 0,
          }}
        >
          <WarningOutlined
            style={{
              color: "#faad14",
              marginRight: 8,
            }}
          />

          Current Situation
        </Title>

        <Divider />

        <Paragraph
          style={{
            fontSize: 15,
            lineHeight: 1.8,
          }}
        >
          {emergency.message}
        </Paragraph>

        <Tag
          color="gold"
          style={{
            borderRadius: 6,
            padding: "4px 10px",
          }}
        >
          WATCH
        </Tag>
      </Card>

      {/* =====================================================
          IMMEDIATE ACTIONS
      ===================================================== */}

      <Title
        level={4}
        style={{
          marginBottom: 14,
        }}
      >
        What You Should Do
      </Title>

      <Row
        gutter={[16, 16]}
        style={{
          marginBottom: 26,
        }}
      >
        <Col xs={24} sm={12}>
          <Card
            bordered={false}
            style={{
              height: "100%",
              borderRadius: 14,
              boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
            }}
          >
            <Space align="start">
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "#fff7e6",
                  color: "#fa8c16",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                <ArrowUpOutlined />
              </div>

              <div>
                <Text strong>Move to higher ground</Text>

                <Paragraph
                  type="secondary"
                  style={{
                    marginTop: 5,
                    marginBottom: 0,
                  }}
                >
                  Move away from low-lying areas if water levels continue to
                  rise.
                </Paragraph>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card
            bordered={false}
            style={{
              height: "100%",
              borderRadius: 14,
              boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
            }}
          >
            <Space align="start">
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "#fff1f0",
                  color: "#ff4d4f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                <SafetyOutlined />
              </div>

              <div>
                <Text strong>Avoid flood water</Text>

                <Paragraph
                  type="secondary"
                  style={{
                    marginTop: 5,
                    marginBottom: 0,
                  }}
                >
                  Do not walk or drive through flooded roads or moving water.
                </Paragraph>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card
            bordered={false}
            style={{
              height: "100%",
              borderRadius: 14,
              boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
            }}
          >
            <Space align="start">
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "#e6f4ff",
                  color: "#1677ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                <InfoCircleOutlined />
              </div>

              <div>
                <Text strong>Follow official instructions</Text>

                <Paragraph
                  type="secondary"
                  style={{
                    marginTop: 5,
                    marginBottom: 0,
                  }}
                >
                  Follow instructions from emergency services and local
                  authorities.
                </Paragraph>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card
            bordered={false}
            style={{
              height: "100%",
              borderRadius: 14,
              boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
            }}
          >
            <Space align="start">
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "#f6ffed",
                  color: "#52c41a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                <HomeOutlined />
              </div>

              <div>
                <Text strong>Keep emergency supplies ready</Text>

                <Paragraph
                  type="secondary"
                  style={{
                    marginTop: 5,
                    marginBottom: 0,
                  }}
                >
                  Keep water, food, medicines, documents and essential items
                  ready.
                </Paragraph>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* =====================================================
          EVACUATION
      ===================================================== */}

      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          marginBottom: 20,
          boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
        }}
      >
        <Title
          level={4}
          style={{
            marginTop: 0,
          }}
        >
          <CarOutlined
            style={{
              marginRight: 8,
              color: "#1677ff",
            }}
          />

          Evacuation Information
        </Title>

        <Divider />

        <Space
          direction="vertical"
          size={14}
          style={{
            width: "100%",
          }}
        >
          <div>
            <Text type="secondary">
              Evacuation status
            </Text>

            <div
              style={{
                marginTop: 5,
              }}
            >
              <Tag
                color={
                  emergency.evacuationRequired
                    ? "red"
                    : "green"
                }
                style={{
                  borderRadius: 6,
                }}
              >
                {emergency.evacuationRequired
                  ? "EVACUATION REQUIRED"
                  : "NO ACTIVE EVACUATION ORDER"}
              </Tag>
            </div>
          </div>

          <div>
            <Text
              strong
              style={{
                display: "block",
                marginBottom: 8,
              }}
            >
              Recommended safe locations
            </Text>

            {emergency.safeLocations.map(
              (location, index) => (
                <div
                  key={index}
                  style={{
                    padding: "8px 0",
                  }}
                >
                  <EnvironmentOutlined
                    style={{
                      marginRight: 8,
                      color: "#52c41a",
                    }}
                  />

                  <Text>
                    {location}
                  </Text>
                </div>
              )
            )}
          </div>
        </Space>
      </Card>

      {/* =====================================================
          EMERGENCY CONTACTS
      ===================================================== */}

      <Title
        level={4}
        style={{
          marginBottom: 14,
        }}
      >
        Emergency Contacts
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: 14,
              boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
            }}
          >
            <Space align="start">
              <PhoneOutlined
                style={{
                  fontSize: 22,
                  color: "#ff4d4f",
                }}
              />

              <div>
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                  }}
                >
                  Rescue / Emergency
                </Text>

                <Text
                  strong
                  style={{
                    fontSize: 18,
                  }}
                >
                  Emergency Services
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: 14,
              boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
            }}
          >
            <Space align="start">
              <PhoneOutlined
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
                  }}
                >
                  Police
                </Text>

                <Text
                  strong
                  style={{
                    fontSize: 18,
                  }}
                >
                  Local Police
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: 14,
              boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
            }}
          >
            <Space align="start">
              <PhoneOutlined
                style={{
                  fontSize: 22,
                  color: "#52c41a",
                }}
              />

              <div>
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                  }}
                >
                  Medical Emergency
                </Text>

                <Text
                  strong
                  style={{
                    fontSize: 18,
                  }}
                >
                  Ambulance Services
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmergencyInfo;

