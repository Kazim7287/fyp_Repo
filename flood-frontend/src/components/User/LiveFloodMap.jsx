import { Card, Typography, Button } from "antd";
import {
  EnvironmentOutlined,
  ExpandOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const LiveFloodMap = () => {
  return (
    <Card
      style={{
        borderRadius: 14,
      }}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div
        style={{
          padding: "20px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title
            level={4}
            style={{
              margin: 0,
            }}
          >
            Live Flood Map
          </Title>

          <Text type="secondary">
            Current flood conditions in your monitored area
          </Text>
        </div>

        <Button
          icon={<ExpandOutlined />}
          onClick={() => {
            window.location.href =
              "/user/flood-map";
          }}
        >
          Open Map
        </Button>
      </div>

      <div
        style={{
          height: 360,
          background:
            "linear-gradient(135deg, #e6f4ff, #bae0ff)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* MAP PLACEHOLDER */}

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <EnvironmentOutlined
            style={{
              fontSize: 48,
              color: "#1677ff",
              marginBottom: 12,
            }}
          />

          <Title
            level={4}
            style={{
              margin: 0,
            }}
          >
            Live Flood Map
          </Title>

          <Text type="secondary">
            Interactive map will be available here
          </Text>
        </div>

        {/* STATUS */}

        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            background: "#ffffff",
            padding: "8px 14px",
            borderRadius: 8,
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Text strong>
            ● Monitoring Active
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default LiveFloodMap;