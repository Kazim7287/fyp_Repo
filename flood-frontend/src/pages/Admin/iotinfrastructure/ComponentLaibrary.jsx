
import { useState } from "react";

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

const { Title, Text } = Typography;

const ComponentLibrary = () => {
  const [components, setComponents] = useState([
    {
      key: 1,
      name: "ESP32-WROOM-32",
      category: "Microcontroller",
      model: "ESP32-WROOM-32",
      manufacturer: "Espressif",
      interface: "GPIO / Wi-Fi / Bluetooth",
      voltage: "3.3V",
      quantity: 5,
    },
    {
      key: 2,
      name: "SX1278 LoRa Module",
      category: "Communication",
      model: "SX1278",
      manufacturer: "Generic",
      interface: "SPI",
      voltage: "3.3V",
      quantity: 5,
    },
    {
      key: 3,
      name: "HC-SR04",
      category: "Water Level",
      model: "HC-SR04",
      manufacturer: "Generic",
      interface: "GPIO",
      voltage: "5V",
      quantity: 3,
    },
    {
      key: 4,
      name: "DHT22",
      category: "Temperature / Humidity",
      model: "DHT22",
      manufacturer: "Generic",
      interface: "Digital",
      voltage: "3.3V - 5V",
      quantity: 4,
    },
    {
      key: 5,
      name: "Tipping Bucket Rain Gauge",
      category: "Rainfall",
      model: "Pulse Type",
      manufacturer: "Generic",
      interface: "Pulse",
      voltage: "5V",
      quantity: 3,
    },
    {
      key: 6,
      name: "Water Flow Sensor",
      category: "Water Flow",
      model: "YF-S201",
      manufacturer: "Generic",
      interface: "Pulse",
      voltage: "5V",
      quantity: 3,
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);

  const [form] = Form.useForm();

  const openAddModal = () => {
    setEditingComponent(null);
    form.resetFields();
    setModalOpen(true);
  };

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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingComponent) {
        setComponents((prev) =>
          prev.map((item) =>
            item.key === editingComponent.key
              ? {
                  ...item,
                  ...values,
                }
              : item
          )
        );

        message.success("Component updated successfully");
      } else {
        const newComponent = {
          key: Date.now(),
          ...values,
        };

        setComponents((prev) => [
          ...prev,
          newComponent,
        ]);

        message.success("Component added successfully");
      }

      setModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Form validation error
    }
  };

  const deleteComponent = (key) => {
    setComponents((prev) =>
      prev.filter((item) => item.key !== key)
    );

    message.success("Component deleted successfully");
  };

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

  const columns = [
    {
      title: "Component",
      dataIndex: "name",
      key: "name",
      render: (value, record) => (
        <Space>
          {getCategoryIcon(record.category)}

          <Text strong>{value}</Text>
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
    },

    {
      title: "Manufacturer",
      dataIndex: "manufacturer",
      key: "manufacturer",
    },

    {
      title: "Interface",
      dataIndex: "interface",
      key: "interface",
    },

    {
      title: "Voltage",
      dataIndex: "voltage",
      key: "voltage",
    },

    {
      title: "Available",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => (
        <Tag
          color={
            quantity > 0
              ? "success"
              : "error"
          }
        >
          {quantity}
        </Tag>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() =>
              openEditModal(record)
            }
          />

          <Popconfirm
            title="Delete component?"
            description="This component will be removed from the library."
            okText="Delete"
            cancelText="Cancel"
            onConfirm={() =>
              deleteComponent(record.key)
            }
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* HEADER */}

      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Title
            level={3}
            style={{ marginBottom: 4 }}
          >
            Component Library
          </Title>

          <Text type="secondary">
            Manage the hardware components and sensors
            available for deployment on IoT nodes.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddModal}
        >
          Add Component
        </Button>
      </div>

      {/* COMPONENT TABLE */}

      <Card>
        {components.length > 0 ? (
          <Table
            rowKey="key"
            columns={columns}
            dataSource={components}
            pagination={{
              pageSize: 10,
            }}
            scroll={{
              x: "max-content",
            }}
          />
        ) : (
          <Empty
            description="No components registered"
          />
        )}
      </Card>

      {/* ADD / EDIT MODAL */}

      <Modal
        title={
          editingComponent
            ? "Edit Component"
            : "Add Component"
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSubmit}
        okText={
          editingComponent
            ? "Update Component"
            : "Add Component"
        }
        width={650}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
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
                  value: "Microcontroller",
                  label: "Microcontroller",
                },
                {
                  value: "Water Level",
                  label: "Water Level Sensor",
                },
                {
                  value: "Rainfall",
                  label: "Rainfall Sensor",
                },
                {
                  value: "Temperature / Humidity",
                  label:
                    "Temperature / Humidity",
                },
                {
                  value: "Water Flow",
                  label: "Water Flow Sensor",
                },
                {
                  value: "Communication",
                  label: "Communication",
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

          <Form.Item
            label="Model"
            name="model"
          >
            <Input placeholder="e.g. YF-S201" />
          </Form.Item>

          <Form.Item
            label="Manufacturer"
            name="manufacturer"
          >
            <Input placeholder="e.g. Espressif" />
          </Form.Item>

          <Form.Item
            label="Interface"
            name="interface"
          >
            <Input
              placeholder="e.g. GPIO, SPI, I2C, UART, Pulse"
            />
          </Form.Item>

          <Form.Item
            label="Voltage"
            name="voltage"
          >
            <Input placeholder="e.g. 3.3V" />
          </Form.Item>

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
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComponentLibrary;
