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
  CloudOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  FireOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const EnvironmentalData = () => {
  const data = [
    {
      key: 1,
      parameter: "Rainfall",
      value: "12.4",
      unit: "mm",
      status: "Normal",
      updated: "2 min ago",
    },
    {
      key: 2,
      parameter: "Temperature",
      value: "28.6",
      unit: "°C",
      status: "Normal",
      updated: "2 min ago",
    },
    {
      key: 3,
      parameter: "Humidity",
      value: "71.2",
      unit: "%",
      status: "Normal",
      updated: "3 min ago",
    },
    {
      key: 4,
      parameter: "Soil Moisture",
      value: "58",
      unit: "%",
      status: "Moderate",
      updated: "4 min ago",
    },
    {
      key: 5,
      parameter: "Wind Speed",
      value: "18.2",
      unit: "km/h",
      status: "Normal",
      updated: "5 min ago",
    },
  ];

  const columns = [
    {
      title: "Environmental Parameter",
      dataIndex: "parameter",
      key: "parameter",
      render: (value) => (
        <Text strong>{value}</Text>
      ),
    },
    {
      title: "Current Value",
      key: "value",
      render: (_, record) => (
        <Text>
          {record.value} {record.unit}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Normal"
              ? "success"
              : status === "Moderate"
              ? "warning"
              : "error"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Last Updated",
      dataIndex: "updated",
      key: "updated",
    },
  ];

  return (
    <div>
      {/* PAGE HEADER */}

      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          Environmental Data
        </Title>

        <Text type="secondary">
          Monitor real-time environmental conditions
          collected from field sensors and external
          data sources.
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
              title="Rainfall"
              value={12.4}
              suffix="mm"
              prefix={<CloudOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Temperature"
              value={28.6}
              suffix="°C"
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Humidity"
              value={71.2}
              suffix="%"
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Wind Speed"
              value={18.2}
              suffix="km/h"
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* ENVIRONMENTAL DATA TABLE */}

      <Card
        title={
          <Space>
            <CloudOutlined />
            Environmental Measurements
          </Space>
        }
      >
        <Table
          rowKey="key"
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{
            x: "max-content",
          }}
        />
      </Card>
    </div>
  );
};

export default EnvironmentalData;