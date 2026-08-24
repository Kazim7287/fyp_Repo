import {
  Card,
  Typography,
  Statistic,
  Row,
  Col,
  Table,
  Tag,
  Space,
} from "antd";

import {
  ApiOutlined,
  WifiOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const IoTInfrastructure = () => {
  const devices = [
    {
      key: 1,
      deviceId: "NODE-001",
      location: "Nowshera",
      type: "ESP32 Sensor Node",
      connection: "Online",
      battery: "92%",
      lastSeen: "10 sec ago",
    },
    {
      key: 2,
      deviceId: "NODE-002",
      location: "Kabul River",
      type: "ESP32 Sensor Node",
      connection: "Online",
      battery: "87%",
      lastSeen: "18 sec ago",
    },
    {
      key: 3,
      deviceId: "NODE-003",
      location: "Charsadda",
      type: "ESP32 Sensor Node",
      connection: "Offline",
      battery: "41%",
      lastSeen: "18 min ago",
    },
    {
      key: 4,
      deviceId: "GW-001",
      location: "Nowshera",
      type: "LoRa Gateway",
      connection: "Online",
      battery: "100%",
      lastSeen: "5 sec ago",
    },
  ];

  const columns = [
    {
      title: "Device ID",
      dataIndex: "deviceId",
      key: "deviceId",
      render: (value) => (
        <Text strong>{value}</Text>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Device Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Connection",
      dataIndex: "connection",
      key: "connection",
      render: (status) => (
        <Tag
          icon={
            status === "Online"
              ? <CheckCircleOutlined />
              : <DisconnectOutlined />
          }
          color={
            status === "Online"
              ? "success"
              : "error"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Battery",
      dataIndex: "battery",
      key: "battery",
      render: (battery) => {
        const value = parseInt(battery);

        return (
          <Tag
            color={
              value >= 70
                ? "success"
                : value >= 40
                ? "warning"
                : "error"
            }
          >
            {battery}
          </Tag>
        );
      },
    },
    {
      title: "Last Seen",
      dataIndex: "lastSeen",
      key: "lastSeen",
    },
  ];

  return (
    <div>
      {/* HEADER */}

      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          IoT Infrastructure
        </Title>

        <Text type="secondary">
          Monitor sensor nodes, LoRa gateways,
          connectivity, and device health.
        </Text>
      </div>

      {/* STATISTICS */}

      <Row
        gutter={[16, 16]}
        style={{ marginBottom: 24 }}
      >
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Devices"
              value={24}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Online Devices"
              value={21}
              prefix={<WifiOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Offline Devices"
              value={3}
              prefix={<DisconnectOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Healthy Battery"
              value={22}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* DEVICE TABLE */}

      <Card
        title={
          <Space>
            <ApiOutlined />
            Registered IoT Devices
          </Space>
        }
      >
        <Table
          rowKey="key"
          columns={columns}
          dataSource={devices}
          pagination={{
            pageSize: 10,
          }}
          scroll={{
            x: "max-content",
          }}
        />
      </Card>
    </div>
  );
};

export default IoTInfrastructure;