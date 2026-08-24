import { Card, Row, Col, Typography } from "antd";

import {
  CloudOutlined,
  DashboardOutlined,
  SafetyOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const SummaryCards = () => {
  const cards = [
    {
      title: "Rainfall",
      value: "12.4",
      unit: "mm",
      icon: <CloudOutlined />,
    },
    {
      title: "River Flow",
      value: "2.4",
      unit: "m³/s",
      icon: <DashboardOutlined />,
    },
    {
      title: "Flood Risk",
      value: "34",
      unit: "%",
      icon: <SafetyOutlined />,
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      {cards.map((card) => (
        <Col xs={24} md={8} key={card.title}>
          <Card
            style={{
              borderRadius: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Text type="secondary">
                  {card.title}
                </Text>

                <div
                  style={{
                    marginTop: 6,
                  }}
                >
                  <Title
                    level={3}
                    style={{
                      margin: 0,
                    }}
                  >
                    {card.value}{" "}
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 14,
                      }}
                    >
                      {card.unit}
                    </Text>
                  </Title>
                </div>
              </div>

              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: "#f0f5ff",
                  color: "#1677ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                {card.icon}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SummaryCards;