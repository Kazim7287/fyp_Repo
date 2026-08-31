import { useEffect, useState } from "react";

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
  Modal,
  Descriptions,
  Spin,
  Alert,
  Empty,
  message,
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

import { useDispatch, useSelector } from "react-redux";

import {
  fetchNodes,
  fetchNodeById,
  clearSelectedNode,
  clearNodeError,
  selectNodes,
  selectSelectedNode,
  selectNodesLoading,
  selectNodeDetailsLoading,
  selectNodesError,
  selectNodeDetailsError,
} from "../../../store/slices/nodeSlice";

import ComponentLaibrary from "./ComponentLaibrary";

const { Title, Text } = Typography;

// =========================================================
// COMPONENT
// =========================================================

const Iotinfrastructure = () => {
  const dispatch = useDispatch();

  // =======================================================
  // REDUX STATE
  // =======================================================

  const nodes = useSelector(selectNodes);

  const selectedNode = useSelector(
    selectSelectedNode
  );

  const loading = useSelector(
    selectNodesLoading
  );

  const detailsLoading = useSelector(
    selectNodeDetailsLoading
  );

  const error = useSelector(
    selectNodesError
  );

  const detailsError = useSelector(
    selectNodeDetailsError
  );

  // =======================================================
  // LOCAL STATE
  // =======================================================

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  // =======================================================
  // FETCH NODES
  // =======================================================

  useEffect(() => {
    dispatch(fetchNodes());
  }, [dispatch]);

  // =======================================================
  // SHOW API ERROR
  // =======================================================

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // =======================================================
  // NODE DETAILS
  // =======================================================

  const openNodeDetails = (record) => {
    setDetailsOpen(true);

    dispatch(fetchNodeById(record.id));
  };

  // =======================================================
  // CLOSE DETAILS
  // =======================================================

  const closeNodeDetails = () => {
    setDetailsOpen(false);

    dispatch(clearSelectedNode());
  };

  // =======================================================
  // CALCULATE STATISTICS
  // =======================================================

  const totalDevices = nodes.length;

  const onlineDevices = nodes.filter(
    (node) =>
      node.connection === "Online"
  ).length;

  const offlineDevices = nodes.filter(
    (node) =>
      node.connection === "Offline"
  ).length;

  const lowBatteryDevices = nodes.filter(
    (node) => {
      const battery = Number(
        node.battery
      );

      return (
        !Number.isNaN(battery) &&
        battery < 40
      );
    }
  ).length;

  // =======================================================
  // HELPERS
  // =======================================================

  const getConnectionStatus = (
    connection
  ) => {
    if (!connection) {
      return (
        <Tag>
          Not Connected
        </Tag>
      );
    }

    if (connection === "Online") {
      return (
        <Tag
          icon={
            <CheckCircleOutlined />
          }
          color="success"
        >
          Online
        </Tag>
      );
    }

    if (connection === "Offline") {
      return (
        <Tag
          icon={
            <DisconnectOutlined />
          }
          color="error"
        >
          Offline
        </Tag>
      );
    }

    return (
      <Tag>
        {connection}
      </Tag>
    );
  };

  const getBatteryStatus = (
    battery
  ) => {
    if (
      battery === null ||
      battery === undefined ||
      battery === ""
    ) {
      return (
        <Tag>
          Not Available
        </Tag>
      );
    }

    const value = Number(
      battery
    );

    if (Number.isNaN(value)) {
      return (
        <Tag>
          {battery}
        </Tag>
      );
    }

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
        {value}%
      </Tag>
    );
  };

  // =======================================================
  // TABLE COLUMNS
  // =======================================================

  const columns = [
    {
      title: "Device ID",
      dataIndex: "device_id",
      key: "device_id",

      render: (value) => (
        <Text strong>
          {value || "N/A"}
        </Text>
      ),
    },

    {
      title: "Node Name",
      dataIndex: "node_name",
      key: "node_name",

      render: (value) => (
        <Text>
          {value || "N/A"}
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

          <Text>
            {location || "Not Set"}
          </Text>
        </Space>
      ),
    },

    {
      title: "Device Type",
      dataIndex: "device_type",
      key: "device_type",

      render: (value) => (
        <Text>
          {value || "N/A"}
        </Text>
      ),
    },

    {
      title: "Components",
      dataIndex: "component_count",
      key: "component_count",

      render: (value) => (
        <Tag color="blue">
          {value || 0} Components
        </Tag>
      ),
    },

    {
      title: "Connection",
      dataIndex: "connection",
      key: "connection",

      render: (status) =>
        getConnectionStatus(
          status
        ),
    },

    {
      title: "Battery",
      dataIndex: "battery",
      key: "battery",

      render: (battery) =>
        getBatteryStatus(
          battery
        ),
    },

    {
      title: "Last Seen",
      dataIndex: "last_seen",
      key: "last_seen",

      render: (value) => (
        <Text>
          {value || "Never"}
        </Text>
      ),
    },

    {
      title: "Action",
      key: "action",

      render: (_, record) => (
        <Button
          type="link"
          icon={<RightOutlined />}
          onClick={() =>
            openNodeDetails(
              record
            )
          }
        >
          Details
        </Button>
      ),
    },
  ];

  // =======================================================
  // NODES CONTENT
  // =======================================================

  const nodesContent = (
    <div>

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

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

      {/* ===================================================
          API ERROR
      =================================================== */}

      {error && (
        <Alert
          style={{
            marginBottom: 24,
          }}
          type="error"
          showIcon
          message="Unable to load IoT nodes"
          description={error}
          closable
          onClose={() =>
            dispatch(
              clearNodeError()
            )
          }
        />
      )}

      {/* ===================================================
          STATISTICS
      =================================================== */}

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
              value={
                loading
                  ? 0
                  : totalDevices
              }
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
              value={
                loading
                  ? 0
                  : onlineDevices
              }
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
              value={
                loading
                  ? 0
                  : offlineDevices
              }
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
              value={
                loading
                  ? 0
                  : lowBatteryDevices
              }
              prefix={
                <ThunderboltOutlined />
              }
            />
          </Card>
        </Col>

      </Row>

      {/* ===================================================
          REGISTERED DEVICES
      =================================================== */}

      <Card
        title={
          <Space>
            <ApiOutlined />

            Registered IoT Devices
          </Space>
        }
      >

        {loading ? (
          <div
            style={{
              minHeight: 250,
              display: "flex",
              justifyContent:
                "center",
              alignItems:
                "center",
            }}
          >
            <Spin
              size="large"
              tip="Loading IoT nodes..."
            />
          </div>
        ) : nodes.length === 0 ? (
          <Empty
            description="No IoT nodes registered"
          />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={nodes}
            pagination={{
              pageSize: 10,
            }}
            scroll={{
              x: "max-content",
            }}
          />
        )}

      </Card>

    </div>
  );

  // =======================================================
  // MAIN PAGE
  // =======================================================

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

            children:
              nodesContent,
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

      {/* =================================================
          NODE DETAILS MODAL
      ================================================= */}

      <Modal
        title={
          <Space>
            <ApiOutlined />

            Node Details
          </Space>
        }
        open={detailsOpen}
        onCancel={
          closeNodeDetails
        }
        footer={null}
        width={750}
        destroyOnClose
      >

        {detailsLoading ? (
          <div
            style={{
              minHeight: 250,
              display: "flex",
              justifyContent:
                "center",
              alignItems:
                "center",
            }}
          >
            <Spin
              size="large"
              tip="Loading node details..."
            />
          </div>
        ) : detailsError ? (
          <Alert
            type="error"
            showIcon
            message="Failed to load node details"
            description={
              detailsError
            }
          />
        ) : selectedNode ? (
          <Space
            direction="vertical"
            size="large"
            style={{
              width: "100%",
            }}
          >

            {/* BASIC INFORMATION */}

            <Descriptions
              title="Node Information"
              bordered
              column={{
                xs: 1,
                sm: 2,
              }}
            >
              <Descriptions.Item
                label="Device ID"
              >
                {
                  selectedNode.device_id ||
                  "N/A"
                }
              </Descriptions.Item>

              <Descriptions.Item
                label="Node Name"
              >
                {
                  selectedNode.node_name ||
                  "N/A"
                }
              </Descriptions.Item>

              <Descriptions.Item
                label="Device Type"
              >
                {
                  selectedNode.device_type ||
                  "N/A"
                }
              </Descriptions.Item>

              <Descriptions.Item
                label="Location"
              >
                <Space>
                  <EnvironmentOutlined />

                  {
                    selectedNode.location ||
                    "Not Set"
                  }
                </Space>
              </Descriptions.Item>

              <Descriptions.Item
                label="Connection"
              >
                {getConnectionStatus(
                  selectedNode.connection
                )}
              </Descriptions.Item>

              <Descriptions.Item
                label="Battery"
              >
                {getBatteryStatus(
                  selectedNode.battery
                )}
              </Descriptions.Item>

              <Descriptions.Item
                label="Last Seen"
              >
                {
                  selectedNode.last_seen ||
                  "Never"
                }
              </Descriptions.Item>

              <Descriptions.Item
                label="Components"
              >
                {
                  selectedNode.component_count ||
                  0
                }
              </Descriptions.Item>
            </Descriptions>

            {/* COMPONENTS */}

            <Card
              size="small"
              title="Installed Components"
            >

              {selectedNode.components &&
              selectedNode.components.length >
                0 ? (
                <Table
                  rowKey="id"
                  size="small"
                  pagination={false}
                  dataSource={
                    selectedNode.components
                  }
                  columns={[
                    {
                      title:
                        "Component",
                      dataIndex:
                        "name",
                      key: "name",
                    },
                    {
                      title:
                        "Category",
                      dataIndex:
                        "category",
                      key: "category",

                      render:
                        (
                          category
                        ) => (
                          <Tag color="blue">
                            {
                              category ||
                              "Other"
                            }
                          </Tag>
                        ),
                    },
                    {
                      title:
                        "Model",
                      dataIndex:
                        "model",
                      key: "model",

                      render:
                        (
                          model
                        ) =>
                          model ||
                          "N/A",
                    },
                    {
                      title:
                        "Manufacturer",
                      dataIndex:
                        "manufacturer",
                      key:
                        "manufacturer",

                      render:
                        (
                          manufacturer
                        ) =>
                          manufacturer ||
                          "N/A",
                    },
                  ]}
                />
              ) : (
                <Empty
                  image={
                    Empty.PRESENTED_IMAGE_SIMPLE
                  }
                  description="No components assigned"
                />
              )}

            </Card>

          </Space>
        ) : (
          <Empty
            description="No node selected"
          />
        )}

      </Modal>

    </div>
  );
};

export default Iotinfrastructure;