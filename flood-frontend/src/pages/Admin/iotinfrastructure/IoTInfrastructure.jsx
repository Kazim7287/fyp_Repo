
import {
  Card,
  Typography,
  Statistic,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Tabs,
  Button,
} from "antd";

import {
  ApiOutlined,
  WifiOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  DisconnectOutlined,
  EnvironmentOutlined,
  RightOutlined,
} from "@ant-design/icons";

import ComponentLaibrary from "./ComponentLaibrary";

const { Title, Text } = Typography;

const Iotinfrastructure = () => {
  /*
  |--------------------------------------------------------------------------
  | TEMPORARY NODE DATA
  |--------------------------------------------------------------------------
  | Later this data will come from your backend API / database.
  |--------------------------------------------------------------------------
  */

  const devices = [
    {
      key: 1,
      deviceId: "NODE-001",
      nodeName: "Nowshera Flood Monitoring Node",
      location: "Nowshera",
      type: "ESP32 Sensor Node",
      connection: "Online",
      battery: "92%",
      lastSeen: "10 sec ago",
      components: 5,
    },

    {
      key: 2,
      deviceId: "NODE-002",
      nodeName: "Kabul River Monitoring Node",
      location: "Kabul River",
      type: "ESP32 Sensor Node",
      connection: "Online",
      battery: "87%",
      lastSeen: "18 sec ago",
      components: 5,
    },

    {
      key: 3,
      deviceId: "NODE-003",
      nodeName: "Charsadda Monitoring Node",
      location: "Charsadda",
      type: "ESP32 Sensor Node",
      connection: "Offline",
      battery: "41%",
      lastSeen: "18 min ago",
      components: 4,
    },

    {
      key: 4,
      deviceId: "GW-001",
      nodeName: "Nowshera LoRa Gateway",
      location: "Nowshera",
      type: "LoRa Gateway",
      connection: "Online",
      battery: "100%",
      lastSeen: "5 sec ago",
      components: 1,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | TABLE COLUMNS
  |--------------------------------------------------------------------------
  */

  const columns = [
    {
      title: "Device ID",
      dataIndex: "deviceId",
      key: "deviceId",

      render: (value) => (
        <Text strong>
          {value}
        </Text>
      ),
    },

    {
      title: "Node Name",
      dataIndex: "nodeName",
      key: "nodeName",

      render: (value) => (
        <Text>
          {value}
        </Text>
      ),
    },

    {
      title: "Location",
      dataIndex: "location",
      key: "location",

      render: (location) => (
        <Space>
          <EnvironmentOutlined />

          {location}
        </Space>
      ),
    },

    {
      title: "Device Type",
      dataIndex: "type",
      key: "type",
    },

    {
      title: "Components",
      dataIndex: "components",
      key: "components",

      render: (value) => (
        <Tag color="blue">
          {value} Components
        </Tag>
      ),
    },

    {
      title: "Connection",
      dataIndex: "connection",
      key: "connection",

      render: (status) => (
        <Tag
          icon={
            status === "Online" ? (
              <CheckCircleOutlined />
            ) : (
              <DisconnectOutlined />
            )
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
        const value = parseInt(battery, 10);

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

    {
      title: "Action",
      key: "action",

      render: () => (
        <Button
          type="link"
          icon={<RightOutlined />}
        >
          Details
        </Button>
      ),
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | NODES TAB
  |--------------------------------------------------------------------------
  */

  const nodesContent = (
    <div>

      {/* PAGE HEADER */}

      <div
        style={{
          marginBottom: 24,
        }}
      >
        <Title
          level={3}
          style={{
            marginBottom: 4,
          }}
        >
          IoT Infrastructure
        </Title>

        <Text type="secondary">
          Monitor deployed sensor nodes,
          LoRa gateways, connectivity,
          and device health.
        </Text>
      </div>


      {/* STATISTICS */}

      <Row
        gutter={[16, 16]}
        style={{
          marginBottom: 24,
        }}
      >

        {/* TOTAL */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Total Devices"
              value={24}
              prefix={
                <ApiOutlined />
              }
            />
          </Card>
        </Col>


        {/* ONLINE */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Online Devices"
              value={21}
              prefix={
                <WifiOutlined />
              }
            />
          </Card>
        </Col>


        {/* OFFLINE */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Offline Devices"
              value={3}
              prefix={
                <DisconnectOutlined />
              }
            />
          </Card>
        </Col>


        {/* LOW BATTERY */}

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Low Battery"
              value={2}
              prefix={
                <ThunderboltOutlined />
              }
            />
          </Card>
        </Col>

      </Row>


      {/* REGISTERED DEVICES */}

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


  /*
  |--------------------------------------------------------------------------
  | MAIN PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div>

      <Tabs
        defaultActiveKey="nodes"

        items={[
          {
            key: "nodes",

            label: (
              <Space>
                <ApiOutlined />

                Nodes
              </Space>
            ),

            children: nodesContent,
          },

          {
            key: "components",

            label: (
              <Space>
                <ThunderboltOutlined />

                Component Library
              </Space>
            ),

            children: (
              <ComponentLaibrary />
            ),
          },
        ]}
      />

    </div>
  );
};

export default Iotinfrastructure;
