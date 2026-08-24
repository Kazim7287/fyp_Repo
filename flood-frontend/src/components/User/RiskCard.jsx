import {
  Card,
  Typography,
  Tag,
  Progress,
  Row,
  Col,
} from "antd";

import {
  SafetyCertificateOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const RiskCard = () => {
  const risk = 34;

  return (
    <Card
      style={{
        borderRadius: 14,
        marginBottom: 20,
      }}
    >
      <Row align="middle" gutter={[24, 24]}>
        {/* RISK STATUS */}

        <Col xs={24} md={12}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 14,
                background: "#e6f4ff",
                color: "#1677ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              <SafetyCertificateOutlined />
            </div>

            <div>
              <Text type="secondary">
                Current Flood Risk
              </Text>

              <div>
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    fontSize: 28,
                  }}
                >
                  Low
                </Title>
              </div>

              <Tag color="green">
                Normal conditions
              </Tag>
            </div>
          </div>
        </Col>

        {/* RISK SCORE */}

        <Col xs={24} md={12}>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text type="secondary">
                Risk probability
              </Text>

              <Text strong>
                {risk}%
              </Text>
            </div>

            <Progress
              percent={risk}
              showInfo={false}
              strokeColor="#52c41a"
              trailColor="#f0f0f0"
            />

            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ArrowUpOutlined
                style={{
                  color: "#52c41a",
                }}
              />

              <Text type="secondary">
                Risk remains below warning threshold
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default RiskCard;