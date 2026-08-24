import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Space,
} from "antd";

import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  HomeOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const safetyStages = [
  {
    key: "before",
    title: "Before Flood",
    subtitle: "Prepare before flooding begins",
    icon: <HomeOutlined />,
    color: "#1677ff",
    guidance: [
      "Prepare emergency supplies",
      "Keep important documents safe",
      "Know your evacuation route",
    ],
  },
  {
    key: "during",
    title: "During Flood",
    subtitle: "Protect yourself during flooding",
    icon: <ThunderboltOutlined />,
    color: "#fa8c16",
    guidance: [
      "Move to higher ground",
      "Avoid flood water",
      "Follow official instructions",
    ],
  },
  {
    key: "after",
    title: "After Flood",
    subtitle: "Stay safe after the water recedes",
    icon: <CheckCircleOutlined />,
    color: "#52c41a",
    guidance: [
      "Avoid contaminated water",
      "Avoid damaged buildings",
      "Follow safety instructions",
    ],
  },
];

const FloodSafety = () => {
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

      <Card
        variant="borderless"
        style={{
          borderRadius: 14,
          marginBottom: 24,
        }}
      >
        <Space align="start" size={14}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#e6f4ff",
              color: "#1677ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            <SafetyCertificateOutlined />
          </div>

          <div>
            <Title
              level={3}
              style={{
                margin: 0,
              }}
            >
              Flood Safety
            </Title>

            <Text type="secondary">
              Simple safety guidance to help you stay safe before,
              during, and after a flood.
            </Text>
          </div>
        </Space>
      </Card>

      {/* =====================================================
          SAFETY STAGES
      ===================================================== */}

      <Row gutter={[20, 20]}>
        {safetyStages.map((stage) => (
          <Col
            xs={24}
            md={8}
            key={stage.key}
          >
            <Card
              variant="borderless"
              style={{
                height: "100%",
                borderRadius: 14,
                overflow: "hidden",
              }}
              styles={{
                body: {
                  padding: 0,
                },
              }}
            >
              {/* Stage Header */}

              <div
                style={{
                  padding: "22px 22px 18px",
                  borderTop: `4px solid ${stage.color}`,
                }}
              >
                <Space
                  align="center"
                  size={12}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: `${stage.color}15`,
                      color: stage.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 21,
                    }}
                  >
                    {stage.icon}
                  </div>

                  <div>
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                      }}
                    >
                      {stage.title}
                    </Title>

                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                      }}
                    >
                      {stage.subtitle}
                    </Text>
                  </div>
                </Space>
              </div>

              {/* Guidance */}

              <div
                style={{
                  padding: "4px 22px 22px",
                }}
              >
                {stage.guidance.map(
                  (item, index) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "13px 0",
                        borderTop:
                          index === 0
                            ? "none"
                            : "1px solid #f0f0f0",
                      }}
                    >
                      <CheckCircleOutlined
                        style={{
                          color: stage.color,
                          marginTop: 3,
                          flexShrink: 0,
                        }}
                      />

                      <Text
                        style={{
                          fontSize: 14,
                          lineHeight: 1.5,
                        }}
                      >
                        {item}
                      </Text>
                    </div>
                  )
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* =====================================================
          EMERGENCY REMINDER
      ===================================================== */}

      <Card
        variant="borderless"
        style={{
          marginTop: 24,
          borderRadius: 14,
          background: "#fff7e6",
          border: "1px solid #ffd591",
        }}
      >
        <Space
          direction="vertical"
          size={4}
        >
          <Tag color="orange">
            IMPORTANT
          </Tag>

          <Title
            level={5}
            style={{
              margin: 0,
            }}
          >
            Follow official emergency instructions
          </Title>

          <Paragraph
            type="secondary"
            style={{
              margin: 0,
            }}
          >
            If an evacuation order or emergency warning
            is issued, follow the instructions of local
            authorities and move to a safe location.
          </Paragraph>
        </Space>
      </Card>
    </div>
  );
};

export default FloodSafety;