
import { useEffect, useState } from "react";

import {
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Popconfirm,
  message,
  Empty,
  Alert,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  RadarChartOutlined,
  WifiOutlined,
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchComponents,
  addComponent,
  editComponent,
  removeComponent,
  clearComponentError,
} from "../store/slices/componentSlice";

const { Title, Text } = Typography;

const ComponentLibrary = () => {
  // =========================================================
  // REDUX
  // =========================================================

  const dispatch = useDispatch();

  const {
    components,
    loading,
    actionLoading,
    error,
  } = useSelector(
    (state) => state.components
  );

  // =========================================================
  // LOCAL UI STATE
  // =========================================================

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingComponent, setEditingComponent] =
    useState(null);

  const [form] = Form.useForm();

  // =========================================================
  // FETCH COMPONENTS ON PAGE LOAD
  // =========================================================

  useEffect(() => {
    dispatch(fetchComponents());
  }, [dispatch]);

  // =========================================================
  // SHOW REDUX ERROR
  // =========================================================

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearComponentError());
    }
  }, [error, dispatch]);

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const openAddModal = () => {
    setEditingComponent(null);

    form.resetFields();

    setModalOpen(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (record) => {
    setEditingComponent(record);

    form.setFieldsValue({
      name: record.name,
      category: record.category,
      model: record.model,
      manufacturer: record.manufacturer,
      interface: record.interface,
      voltage: record.voltage,
      quantity: record.quantity,
    });

    setModalOpen(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    setModalOpen(false);

    setEditingComponent(null);

    form.resetFields();
  };

  // =========================================================
  // ADD / UPDATE COMPONENT
  // =========================================================

  const handleSubmit = async () => {
    try {
      const values =
        await form.validateFields();

      // =====================================================
      // UPDATE
      // =====================================================

      if (editingComponent) {
        await dispatch(
          editComponent({
            id: editingComponent.id,
            componentData: values,
          })
        ).unwrap();

        message.success(
          "Component updated successfully"
        );
      }

      // =====================================================
      // CREATE
      // =====================================================

      else {
        await dispatch(
          addComponent(values)
        ).unwrap();

        message.success(
          "Component added successfully"
        );
      }

      closeModal();
    } catch (error) {
      // Ant Design validation errors
      // are objects and don't need a message.

      if (typeof error === "string") {
        message.error(error);
      }
    }
  };

  // =========================================================
  // DELETE COMPONENT
  // =========================================================

  const handleDeleteComponent = async (id) => {
    try {
      await dispatch(
        removeComponent(id)
      ).unwrap();

      message.success(
        "Component deleted successfully"
      );
    } catch (error) {
      message.error(
        typeof error === "string"
          ? error
          : "Failed to delete component"
      );
    }
  };

  // =========================================================
  // CATEGORY ICON
  // =========================================================

  const getCategoryIcon = (category) => {
    if (category === "Microcontroller") {
      return <ApiOutlined />;
    }

    if (category === "Communication") {
      return <WifiOutlined />;
    }

    if (category === "Power") {
      return <ThunderboltOutlined />;
    }

    return <RadarChartOutlined />;
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = [
    {
      title: "Component",
      dataIndex: "name",
      key: "name",

      render: (value, record) => (
        <Space>
          {getCategoryIcon(
            record.category
          )}

          <Text strong>
            {value}
          </Text>
        </Space>
      ),
    },

    {
      title: "Category",
      dataIndex: "category",
      key: "category",

      render: (category) => (
        <Tag color="blue">
          {category}
        </Tag>
      ),
    },

    {
      title: "Model",
      dataIndex: "model",
      key: "model",

      render: (model) =>
        model || "-",
    },

    {
      title: "Manufacturer",
      dataIndex: "manufacturer",
      key: "manufacturer",

      render: (manufacturer) =>
        manufacturer || "-",
    },

    {
      title: "Interface",
      dataIndex: "interface",
      key: "interface",

      render: (interfaceValue) =>
        interfaceValue || "-",
    },

    {
      title: "Voltage",
      dataIndex: "voltage",
      key: "voltage",

      render: (voltage) =>
        voltage || "-",
    },

    {
      title: "Available",
      dataIndex: "quantity",
      key: "quantity",

      render: (quantity) => (
        <Tag
          color={
            Number(quantity) > 0
              ? "success"
              : "error"
          }
        >
          {quantity ?? 0}
        </Tag>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      fixed: "right",

      render: (_, record) => (
        <Space>
          {/* EDIT */}

          <Button
            type="text"
            icon={
              <EditOutlined />
            }
            onClick={() =>
              openEditModal(record)
            }
          />

          {/* DELETE */}

          <Popconfirm
            title="Delete component?"
            description="This component will be permanently removed from the library."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{
              danger: true,
            }}
            onConfirm={() =>
              handleDeleteComponent(
                record.id
              )
            }
          >
            <Button
              type="text"
              danger
              icon={
                <DeleteOutlined />
              }
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div>
      {/* =====================================================
          HEADER
      ===================================================== */}

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
            Component Library
          </Title>

          <Text type="secondary">
            Manage the hardware
            components and sensors
            available for deployment
            on IoT nodes.
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
          Add Component
        </Button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <Alert
          type="error"
          showIcon
          closable
          message={error}
          style={{
            marginBottom: 16,
          }}
          onClose={() =>
            dispatch(
              clearComponentError()
            )
          }
        />
      )}

      {/* =====================================================
          COMPONENT TABLE
      ===================================================== */}

      <Card>
        {components.length > 0 ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={components}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: [
                "10",
                "20",
                "50",
              ],
            }}
            scroll={{
              x: "max-content",
            }}
          />
        ) : loading ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={[]}
            loading={true}
            pagination={false}
          />
        ) : (
          <Empty
            description="No components registered"
          />
        )}
      </Card>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      <Modal
        title={
          editingComponent
            ? "Edit Component"
            : "Add Component"
        }
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={
          editingComponent
            ? "Update Component"
            : "Add Component"
        }
        confirmLoading={
          actionLoading
        }
        width={650}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          {/* COMPONENT NAME */}

          <Form.Item
            label="Component Name"
            name="name"
            rules={[
              {
                required: true,
                message:
                  "Please enter component name",
              },
            ]}
          >
            <Input
              placeholder="e.g. ESP32-WROOM-32"
            />
          </Form.Item>

          {/* CATEGORY */}

          <Form.Item
            label="Category"
            name="category"
            rules={[
              {
                required: true,
                message:
                  "Please select category",
              },
            ]}
          >
            <Select
              placeholder="Select category"
              options={[
                {
                  value:
                    "Microcontroller",
                  label:
                    "Microcontroller",
                },
                {
                  value:
                    "Water Level",
                  label:
                    "Water Level Sensor",
                },
                {
                  value:
                    "Rainfall",
                  label:
                    "Rainfall Sensor",
                },
                {
                  value:
                    "Temperature / Humidity",
                  label:
                    "Temperature / Humidity",
                },
                {
                  value:
                    "Water Flow",
                  label:
                    "Water Flow Sensor",
                },
                {
                  value:
                    "Communication",
                  label:
                    "Communication",
                },
                {
                  value: "Power",
                  label: "Power",
                },
                {
                  value: "Other",
                  label: "Other",
                },
              ]}
            />
          </Form.Item>

          {/* MODEL */}

          <Form.Item
            label="Model"
            name="model"
          >
            <Input
              placeholder="e.g. YF-S201"
            />
          </Form.Item>

          {/* MANUFACTURER */}

          <Form.Item
            label="Manufacturer"
            name="manufacturer"
          >
            <Input
              placeholder="e.g. Espressif"
            />
          </Form.Item>

          {/* INTERFACE */}

          <Form.Item
            label="Interface"
            name="interface"
          >
            <Input
              placeholder="e.g. GPIO, SPI, I2C, UART, Pulse"
            />
          </Form.Item>

          {/* VOLTAGE */}

          <Form.Item
            label="Voltage"
            name="voltage"
          >
            <Input
              placeholder="e.g. 3.3V"
            />
          </Form.Item>

          {/* QUANTITY */}

          <Form.Item
            label="Available Quantity"
            name="quantity"
            rules={[
              {
                required: true,
                message:
                  "Please enter quantity",
              },
            ]}
          >
            <InputNumber
              min={0}
              precision={0}
              style={{
                width: "100%",
              }}
              placeholder="e.g. 5"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComponentLibrary;
