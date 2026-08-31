import { useEffect, useMemo, useState } from "react";

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
  Form,
  Input,
  Select,
  InputNumber,
  Descriptions,
  Spin,
  Alert,
  Empty,
  Popconfirm,
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
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchNodes,
  fetchNodeById,
  addNode,
  editNode,
  removeNode,
  clearSelectedNode,
  clearNodeError,
  selectNodes,
  selectSelectedNode,
  selectNodesLoading,
  selectNodeDetailsLoading,
  selectNodesError,
  selectNodeDetailsError,
} from "../../../store/slices/nodeSlice";

import {
  fetchComponents,
  selectComponents,
  selectComponentsLoading,
  selectComponentsError,
} from "../../../store/slices/componentSlice";

import ComponentLaibrary from "./ComponentLaibrary";

const { Title, Text } = Typography;

const Iotinfrastructure = () => {
  const dispatch = useDispatch();

  const [form] = Form.useForm();

  // =========================================================
  // NODE STATE
  // =========================================================

  const nodes = useSelector(selectNodes) || [];

  const selectedNode = useSelector(selectSelectedNode);

  const nodesLoading = useSelector(selectNodesLoading);

  const detailsLoading = useSelector(
    selectNodeDetailsLoading
  );

  const nodeError = useSelector(selectNodesError);

  const detailsError = useSelector(
    selectNodeDetailsError
  );

  // =========================================================
  // COMPONENT STATE
  // =========================================================

  const components =
    useSelector(selectComponents) || [];

  const componentsLoading = useSelector(
    selectComponentsLoading
  );

  const componentsError = useSelector(
    selectComponentsError
  );

  // =========================================================
  // LOCAL STATE
  // =========================================================

  const [nodeModalOpen, setNodeModalOpen] =
    useState(false);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [editingNode, setEditingNode] =
    useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    dispatch(fetchNodes());
    dispatch(fetchComponents());
  }, [dispatch]);

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  useEffect(() => {
    if (nodeError) {
      message.error(nodeError);
    }
  }, [nodeError]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalDevices = nodes.length;

  const onlineDevices = nodes.filter(
    (node) =>
      String(node.connection || "").toLowerCase() ===
      "online"
  ).length;

  const offlineDevices = nodes.filter(
    (node) =>
      String(node.connection || "").toLowerCase() ===
      "offline"
  ).length;

  const lowBatteryDevices = nodes.filter((node) => {
    if (
      node.battery === null ||
      node.battery === undefined ||
      node.battery === ""
    ) {
      return false;
    }

    const battery = Number(node.battery);

    return !Number.isNaN(battery) && battery < 40;
  }).length;

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const openAddModal = () => {
    setEditingNode(null);

    form.resetFields();

    form.setFieldsValue({
      device_type: "ESP32 Sensor Node",
      components: [],
    });

    setNodeModalOpen(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (record) => {
    setEditingNode(record);

    form.setFieldsValue({
      device_id: record.device_id || "",
      node_name: record.node_name || "",
      device_type:
        record.device_type || "ESP32 Sensor Node",

      location:
        record.location_name ||
        record.location ||
        "",

      latitude:
        record.latitude !== null &&
        record.latitude !== undefined
          ? Number(record.latitude)
          : undefined,

      longitude:
        record.longitude !== null &&
        record.longitude !== undefined
          ? Number(record.longitude)
          : undefined,
    });

    setNodeModalOpen(true);
  };

  // =========================================================
  // CLOSE NODE MODAL
  // =========================================================

  const closeNodeModal = () => {
    setNodeModalOpen(false);
    setEditingNode(null);
    form.resetFields();
  };

  // =========================================================
  // CREATE / UPDATE NODE
  // =========================================================

  const handleNodeSubmit = async () => {
    try {
      const values =
        await form.validateFields();

      setSubmitting(true);

      // IMPORTANT:
      // These names MUST match the backend controller.
      const payload = {
        deviceId: values.device_id.trim(),

        nodeName: values.node_name.trim(),

        deviceType:
          values.device_type ||
          "ESP32 Sensor Node",

        locationName:
          values.location?.trim() || null,

        latitude:
          values.latitude !== undefined
            ? Number(values.latitude)
            : null,

        longitude:
          values.longitude !== undefined
            ? Number(values.longitude)
            : null,
      };

      // =====================================================
      // UPDATE
      // =====================================================

      if (editingNode) {
        await dispatch(
          editNode({
            id: editingNode.id,
            data: payload,
          })
        ).unwrap();

        message.success(
          "Node updated successfully"
        );
      }

      // =====================================================
      // CREATE
      // =====================================================

      else {
        payload.components =
          (values.components || []).map(
            (item) => ({
              componentId:
                Number(item.component_id),

              quantity:
                Number(item.quantity || 1),
            })
          );

        await dispatch(
          addNode(payload)
        ).unwrap();

        message.success(
          "Node created successfully"
        );
      }

      closeNodeModal();

      await dispatch(fetchNodes()).unwrap();
    } catch (error) {
      console.error(
        "Node submit error:",
        error
      );

      message.error(
        error?.message ||
          "Failed to save node"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // DELETE NODE
  // =========================================================

  const handleDeleteNode = async (id) => {
    try {
      await dispatch(
        removeNode(id)
      ).unwrap();

      message.success(
        "Node deleted successfully"
      );

      await dispatch(fetchNodes()).unwrap();
    } catch (error) {
      console.error(
        "Delete node error:",
        error
      );

      message.error(
        error?.message ||
          "Failed to delete node"
      );
    }
  };

  // =========================================================
  // NODE DETAILS
  // =========================================================

  const openNodeDetails = (record) => {
    setDetailsOpen(true);

    dispatch(
      fetchNodeById(record.id)
    );
  };

  // =========================================================
  // CLOSE DETAILS
  // =========================================================

  const closeNodeDetails = () => {
    setDetailsOpen(false);

    dispatch(
      clearSelectedNode()
    );
  };

  // =========================================================
  // CONNECTION STATUS
  // =========================================================

  const renderConnection = (connection) => {
    if (
      connection === null ||
      connection === undefined ||
      connection === ""
    ) {
      return (
        <Tag>
          Not Connected
        </Tag>
      );
    }

    const status =
      String(connection).toLowerCase();

    if (status === "online") {
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

    if (status === "offline") {
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

  // =========================================================
  // BATTERY STATUS
  // =========================================================

  const renderBattery = (battery) => {
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

    const value = Number(battery);

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

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
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
        key: "location",

        render: (_, record) => (
          <Space>
            <EnvironmentOutlined />

            <Text>
              {record.location_name ||
                record.location ||
                "Not Set"}
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
        key: "components",

        render: (_, record) => {
          const count =
            Array.isArray(
              record.components
            )
              ? record.components.length
              : Number(
                  record.component_count || 0
                );

          return (
            <Tag color="blue">
              {count} Components
            </Tag>
          );
        },
      },

      {
        title: "Connection",
        dataIndex: "connection",
        key: "connection",

        render: (value) =>
          renderConnection(value),
      },

      {
        title: "Battery",
        dataIndex: "battery",
        key: "battery",

        render: (value) =>
          renderBattery(value),
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
        title: "Actions",
        key: "actions",
        fixed: "right",

        render: (_, record) => (
          <Space>
            <Button
              type="link"
              icon={
                <RightOutlined />
              }
              onClick={() =>
                openNodeDetails(record)
              }
            >
              Details
            </Button>

            <Button
              type="text"
              icon={
                <EditOutlined />
              }
              onClick={() =>
                openEditModal(record)
              }
            />

            <Popconfirm
              title="Delete this node?"
              description="The node and its component assignments will be removed."
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{
                danger: true,
              }}
              onConfirm={() =>
                handleDeleteNode(
                  record.id
                )
              }
            >
              <Button
                danger
                type="text"
                icon={
                  <DeleteOutlined />
                }
              />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    []
  );

  // =========================================================
  // NODE CONTENT
  // =========================================================

  const nodesContent = (
    <div>
      {/* HEADER */}

      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Title
            level={3}
            style={{
              marginBottom: 4,
            }}
          >
            IoT Infrastructure
          </Title>

          <Text type="secondary">
            Manage deployed sensor nodes,
            locations, components,
            connectivity and device health.
          </Text>
        </div>

        <Button
          type="primary"
          icon={
            <PlusOutlined />
          }
          onClick={
            openAddModal
          }
        >
          Add Node
        </Button>
      </div>

      {/* ERROR */}

      {nodeError && (
        <Alert
          style={{
            marginBottom: 24,
          }}
          type="error"
          showIcon
          message="Unable to load IoT nodes"
          description={nodeError}
          closable
          onClose={() =>
            dispatch(
              clearNodeError()
            )
          }
        />
      )}

      {/* STATISTICS */}

      <Row
        gutter={[16, 16]}
        style={{
          marginBottom: 24,
        }}
      >
        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Total Devices"
              value={
                totalDevices
              }
              prefix={
                <ApiOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Online Devices"
              value={
                onlineDevices
              }
              prefix={
                <WifiOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Offline Devices"
              value={
                offlineDevices
              }
              prefix={
                <DisconnectOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Statistic
              title="Low Battery"
              value={
                lowBatteryDevices
              }
              prefix={
                <ThunderboltOutlined />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* NODES */}

      <Card
        title={
          <Space>
            <ApiOutlined />
            Registered IoT Devices
          </Space>
        }
      >
        {nodesLoading ? (
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
          >
            <Button
              type="primary"
              icon={
                <PlusOutlined />
              }
              onClick={
                openAddModal
              }
            >
              Add First Node
            </Button>
          </Empty>
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

  // =========================================================
  // PAGE
  // =========================================================

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

      {/* =====================================================
          ADD / EDIT NODE MODAL
      ===================================================== */}

      <Modal
        title={
          <Space>
            <ApiOutlined />

            {editingNode
              ? "Edit IoT Node"
              : "Add IoT Node"}
          </Space>
        }
        open={
          nodeModalOpen
        }
        onCancel={
          closeNodeModal
        }
        onOk={
          handleNodeSubmit
        }
        confirmLoading={
          submitting
        }
        okText={
          editingNode
            ? "Update Node"
            : "Create Node"
        }
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          {/* DEVICE ID */}

          <Form.Item
            label="Device ID"
            name="device_id"
            rules={[
              {
                required: true,
                message:
                  "Please enter device ID",
              },
            ]}
          >
            <Input
              placeholder="e.g. NODE-001"
              disabled={
                !!editingNode
              }
            />
          </Form.Item>

          {/* NODE NAME */}

          <Form.Item
            label="Node Name"
            name="node_name"
            rules={[
              {
                required: true,
                message:
                  "Please enter node name",
              },
            ]}
          >
            <Input
              placeholder="e.g. Nowshera Flood Monitoring Node"
            />
          </Form.Item>

          {/* DEVICE TYPE */}

          <Form.Item
            label="Device Type"
            name="device_type"
            rules={[
              {
                required: true,
                message:
                  "Please select device type",
              },
            ]}
          >
            <Select
              options={[
                {
                  value:
                    "ESP32 Sensor Node",
                  label:
                    "ESP32 Sensor Node",
                },
                {
                  value:
                    "LoRa Gateway",
                  label:
                    "LoRa Gateway",
                },
                {
                  value:
                    "Raspberry Pi Gateway",
                  label:
                    "Raspberry Pi Gateway",
                },
                {
                  value: "Other",
                  label: "Other",
                },
              ]}
            />
          </Form.Item>

          {/* LOCATION */}

          <Form.Item
            label={
              <Space>
                <GlobalOutlined />
                Location
              </Space>
            }
            name="location"
          >
            <Input
              placeholder="e.g. Nowshera, Pakistan"
            />
          </Form.Item>

          {/* COORDINATES */}

          <Row
            gutter={16}
          >
            <Col
              span={12}
            >
              <Form.Item
                label="Latitude"
                name="latitude"
                rules={[
                  {
                    type: "number",
                    min: -90,
                    max: 90,
                    message:
                      "Latitude must be between -90 and 90",
                  },
                ]}
              >
                <InputNumber
                  style={{
                    width: "100%",
                  }}
                  placeholder="e.g. 34.0159"
                  precision={7}
                />
              </Form.Item>
            </Col>

            <Col
              span={12}
            >
              <Form.Item
                label="Longitude"
                name="longitude"
                rules={[
                  {
                    type: "number",
                    min: -180,
                    max: 180,
                    message:
                      "Longitude must be between -180 and 180",
                  },
                ]}
              >
                <InputNumber
                  style={{
                    width: "100%",
                  }}
                  placeholder="e.g. 71.9754"
                  precision={7}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* COMPONENTS */}

          {!editingNode && (
            <Form.List
              name="components"
            >
              {(
                fields,
                { add, remove }
              ) => (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text strong>
                      Components
                    </Text>

                    <Button
                      type="dashed"
                      icon={
                        <PlusOutlined />
                      }
                      onClick={() =>
                        add({
                          quantity: 1,
                        })
                      }
                    >
                      Add Component
                    </Button>
                  </div>

                  {componentsLoading ? (
                    <Spin />
                  ) : componentsError ? (
                    <Alert
                      type="error"
                      showIcon
                      message={
                        componentsError
                      }
                    />
                  ) : fields.length ===
                    0 ? (
                    <Empty
                      image={
                        Empty.PRESENTED_IMAGE_SIMPLE
                      }
                      description="No components selected"
                    />
                  ) : (
                    fields.map(
                      ({
                        key,
                        name,
                        ...restField
                      }) => (
                        <Space
                          key={key}
                          align="baseline"
                          style={{
                            display:
                              "flex",
                            marginBottom: 8,
                          }}
                        >
                          <Form.Item
                            {...restField}
                            name={[
                              name,
                              "component_id",
                            ]}
                            rules={[
                              {
                                required: true,
                                message:
                                  "Select component",
                              },
                            ]}
                            style={{
                              width: 360,
                            }}
                          >
                            <Select
                              showSearch
                              placeholder="Select component"
                              optionFilterProp="label"
                              options={components.map(
                                (
                                  component
                                ) => ({
                                  value:
                                    component.id,

                                  label:
                                    `${component.name}${
                                      component.model
                                        ? ` (${component.model})`
                                        : ""
                                    }`,
                                })
                              )}
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[
                              name,
                              "quantity",
                            ]}
                            rules={[
                              {
                                required: true,
                                message:
                                  "Enter quantity",
                              },
                            ]}
                          >
                            <InputNumber
                              min={1}
                              placeholder="Qty"
                            />
                          </Form.Item>

                          <Button
                            danger
                            type="text"
                            icon={
                              <DeleteOutlined />
                            }
                            onClick={() =>
                              remove(
                                name
                              )
                            }
                          />
                        </Space>
                      )
                    )
                  )}
                </>
              )}
            </Form.List>
          )}

          {!editingNode && (
            <Alert
              style={{
                marginTop: 16,
              }}
              type="info"
              showIcon
              message="Connection status will be detected automatically"
              description="New nodes start with no connection, battery or last-seen data. These values will be updated when the physical IoT device starts communicating with the system."
            />
          )}
        </Form>
      </Modal>

      {/* =====================================================
          NODE DETAILS MODAL
      ===================================================== */}

      <Modal
        title={
          <Space>
            <ApiOutlined />
            Node Details
          </Space>
        }
        open={
          detailsOpen
        }
        onCancel={
          closeNodeDetails
        }
        footer={null}
        width={800}
        destroyOnClose
      >
        {detailsLoading ? (
          <div
            style={{
              minHeight: 300,
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
                    selectedNode.location_name ||
                    selectedNode.location ||
                    "Not Set"
                  }
                </Space>
              </Descriptions.Item>

              <Descriptions.Item
                label="Latitude"
              >
                {
                  selectedNode.latitude ??
                  "Not Set"
                }
              </Descriptions.Item>

              <Descriptions.Item
                label="Longitude"
              >
                {
                  selectedNode.longitude ??
                  "Not Set"
                }
              </Descriptions.Item>

              <Descriptions.Item
                label="Connection"
              >
                {renderConnection(
                  selectedNode.connection
                )}
              </Descriptions.Item>

              <Descriptions.Item
                label="Battery"
              >
                {renderBattery(
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
                  Array.isArray(
                    selectedNode.components
                  )
                    ? selectedNode
                        .components
                        .length
                    : selectedNode.component_count ||
                      0
                }
              </Descriptions.Item>
            </Descriptions>

            {/* COMPONENTS */}

            <Card
              size="small"
              title={
                <Space>
                  <ThunderboltOutlined />
                  Installed Components
                </Space>
              }
            >
              {Array.isArray(
                selectedNode.components
              ) &&
              selectedNode.components
                .length > 0 ? (
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

                      render: (
                        category
                      ) => (
                        <Tag color="blue">
                          {category ||
                            "Other"}
                        </Tag>
                      ),
                    },

                    {
                      title:
                        "Model",
                      dataIndex:
                        "model",
                      key: "model",

                      render: (
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

                      render: (
                        manufacturer
                      ) =>
                        manufacturer ||
                        "N/A",
                    },

                    {
                      title:
                        "Quantity",
                      dataIndex:
                        "quantity",
                      key:
                        "quantity",

                      render: (
                        quantity
                      ) => (
                        <Tag>
                          {quantity ||
                            1}
                        </Tag>
                      ),
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