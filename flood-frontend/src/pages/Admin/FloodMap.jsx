import { Card, Typography, Tag, Space, Statistic, Row, Col } from "antd";
import {
  EnvironmentOutlined,
  WarningOutlined,
  AimOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const FloodMap = () => {
  return (
    <div>
      {/* PAGE HEADER */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          Flood Map
        </Title>

        <Text type="secondary">
          Monitor flood-prone areas, water levels, and station locations.
        </Text>
      </div>

      {/* STATISTICS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Monitored Areas"
              value={12}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Active Flood Zones"
              value={3}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Monitoring Stations"
              value={18}
              prefix={<AimOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* MAP */}
      <Card
        title={
          <Space>
            <EnvironmentOutlined />
            Flood Monitoring Map
          </Space>
        }
      >
        <div
          style={{
            height: 500,
            width: "100%",
            borderRadius: 10,
            background:
              "linear-gradient(135deg, #dfe9f3 0%, #ffffff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* PLACEHOLDER MAP */}
          <div style={{ textAlign: "center" }}>
            <EnvironmentOutlined
              style={{
                fontSize: 48,
                marginBottom: 12,
              }}
            />

            <Title level={4}>
              Flood Monitoring Map
            </Title>

            <Text type="secondary">
              Interactive GIS map will be integrated here.
            </Text>
          </div>

          {/* SAMPLE FLOOD ZONE */}
          <Tag
            color="red"
            style={{
              position: "absolute",
              top: "25%",
              left: "30%",
              padding: "6px 12px",
            }}
          >
            High Risk Zone
          </Tag>

          <Tag
            color="orange"
            style={{
              position: "absolute",
              top: "55%",
              right: "25%",
              padding: "6px 12px",
            }}
          >
            Moderate Risk
          </Tag>

          <Tag
            color="green"
            style={{
              position: "absolute",
              bottom: "20%",
              left: "20%",
              padding: "6px 12px",
            }}
          >
            Safe Zone
          </Tag>
        </div>
      </Card>
    </div>
  );
};

export default FloodMap;