import { useState } from "react";

import {
  Card,
  Col,
  Row,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Divider,
  Statistic,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  FileProtectOutlined,
  AlertOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/* =========================================================
   INITIAL EMERGENCY INFORMATION
========================================================= */

const initialEmergencyData = [
  {
    id: 1,
    title: "Flood Emergency Helpline",
    category: "Emergency Contact",
    description:
      "Contact the emergency response center for immediate flood-related assistance.",
    contact: "1122",
    location: "Nowshera",
    priority: "Critical",
    status: "Published",
  },

  {
    id: 2,
    title: "Evacuation Procedure",
    category: "Evacuation",
    description:
      "Residents in high-risk areas should move immediately toward designated safe zones.",
    contact: "1122",
    location: "Nowshera",
    priority: "Critical",
    status: "Published",
  },

  {
    id: 3,
    title: "Flood Safety Guidelines",
    category: "Safety Procedure",
    description:
      "Avoid entering flooded roads, bridges, drainage channels, and fast-moving water.",
    contact: "N/A",
    location: "All Regions",
    priority: "High",
    status: "Published",
  },

  {
    id: 4,
    title: "Emergency Shelter Information",
    category: "Shelter",
    description:
      "Designated emergency shelters are available for residents displaced by flooding.",
    contact: "N/A",
    location: "Nowshera",
    priority: "High",
    status: "Draft",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const EmergencyInformation = () => {
  const [data, setData] = useState(initialEmergencyData);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingRecord, setEditingRecord] =
    useState(null);

  const [form] = Form.useForm();

  /* =======================================================
     OPEN CREATE MODAL
  ======================================================= */

  const handleCreate = () => {
    setEditingRecord(null);

    form.resetFields();

    setModalOpen(true);
  };

  /* =======================================================
     OPEN EDIT MODAL
  ======================================================= */

  const handleEdit = (record) => {
    setEditingRecord(record);

    form.setFieldsValue(record);

    setModalOpen(true);
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = (id) => {
    setData((prev) =>
      prev.filter((item) => item.id !== id)
    );

    message.success(
      "Emergency information deleted successfully."
    );
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSubmit = async () => {
    try {
      const values =
        await form.validateFields();

      /* ===============================
         EDIT
      =============================== */

      if (editingRecord) {
        setData((prev) =>
          prev.map((item) =>
            item.id === editingRecord.id
              ? {
                  ...item,
                  ...values,
                }
              : item
          )
        );

        message.success(
          "Emergency information updated successfully."
        );
      }

      /* ===============================
         CREATE
      =============================== */

      else {
        const newRecord = {
          id: Date.now(),
          ...values,
        };

        setData((prev) => [
          ...prev,
          newRecord,
        ]);

        message.success(
          "Emergency information created successfully."
        );
      }

      setModalOpen(false);

      form.resetFields();

      setEditingRecord(null);
    } catch (error) {
      // Validation errors are handled by Ant Design.
    }
  };

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = [
    {
      title: "Emergency Information",
      dataIndex: "title",
      key: "title",

      render: (value, record) => (
        <Space align="start">
          <AlertOutlined
            style={{
              color:
                record.priority === "Critical"
                  ? "#ff4d4f"
                  : "#faad14",

              marginTop: 4,
            }}
          />

          <div>
            <Text strong>
              {value}
            </Text>

            <br />

            <Text
              type="secondary"
              style={{
                fontSize: 12,
              }}
            >
              {record.category}
            </Text>
          </div>
        </Space>
      ),
    },

    {
      title: "Location",
      dataIndex: "location",
      key: "location",

      render: (value) => (
        <Space>
          <EnvironmentOutlined />

          <span>{value}</span>
        </Space>
      ),
    },

    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",

      render: (value) => (
        <Space>
          {value !== "N/A" && (
            <PhoneOutlined />
          )}

          <Text strong={value !== "N/A"}>
            {value}
          </Text>
        </Space>
      ),
    },

    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",

      render: (value) => {
        let color = "default";

        if (value === "Critical") {
          color = "error";
        }

        if (value === "High") {
          color = "warning";
        }

        if (value === "Medium") {
          color = "processing";
        }

        return (
          <Tag color={color}>
            {value}
          </Tag>
        );
      },
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",

      render: (value) => (
        <Tag
          color={
            value === "Published"
              ? "success"
              : "default"
          }
        >
          {value}
        </Tag>
      ),
    },

    {
      title: "Action",
      key: "action",

      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() =>
              handleEdit(record)
            }
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete emergency information?"
            description="This action cannot be undone."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{
              danger: true,
            }}
            onConfirm={() =>
              handleDelete(record.id)
            }
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* =======================================================
     STATISTICS
  ======================================================= */

  const total = data.length;

  const published = data.filter(
    (item) =>
      item.status === "Published"
  ).length;

  const critical = data.filter(
    (item) =>
      item.priority === "Critical"
  ).length;

  const shelters = data.filter(
    (item) =>
      item.category === "Shelter"
  ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div>

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div
        style={{
          marginBottom: 24,

          display: "flex",

          justifyContent:
            "space-between",

          alignItems: "center",

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
            Emergency Information
          </Title>

          <Text type="secondary">
            Manage emergency contacts, evacuation
            information, safety procedures, shelters,
            and critical public information.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Add Emergency Information
        </Button>
      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <Row
        gutter={[
          16,
          16,
        ]}
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
              title="Total Information"
              value={total}
              prefix={
                <FileProtectOutlined />
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
              title="Published"
              value={published}
              prefix={
                <SafetyOutlined />
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
              title="Critical"
              value={critical}
              prefix={
                <AlertOutlined />
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
              title="Shelters"
              value={shelters}
              prefix={
                <EnvironmentOutlined />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* =================================================
          EMERGENCY INFORMATION TABLE
      ================================================= */}

      <Card
        title={
          <Space>
            <AlertOutlined />

            <span>
              Emergency Information Registry
            </span>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          pagination={{
            pageSize: 8,
          }}
          scroll={{
            x: 1000,
          }}
        />
      </Card>

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      <Modal
        title={
          editingRecord
            ? "Edit Emergency Information"
            : "Add Emergency Information"
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingRecord(null);
        }}
        onOk={handleSubmit}
        okText={
          editingRecord
            ? "Update"
            : "Create"
        }
        width={700}
        destroyOnHidden
      >
        <Divider />

        <Form
          form={form}
          layout="vertical"
        >
          <Row
            gutter={[
              16,
              0,
            ]}
          >
            <Col
              xs={24}
              md={16}
            >
              <Form.Item
                label="Title"
                name="title"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter a title.",
                  },
                ]}
              >
                <Input
                  placeholder="e.g. Flood Emergency Helpline"
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={8}
            >
              <Form.Item
                label="Category"
                name="category"
                rules={[
                  {
                    required: true,
                    message:
                      "Please select a category.",
                  },
                ]}
              >
                <Select
                  placeholder="Select category"
                  options={[
                    {
                      value:
                        "Emergency Contact",
                      label:
                        "Emergency Contact",
                    },
                    {
                      value:
                        "Evacuation",
                      label:
                        "Evacuation",
                    },
                    {
                      value:
                        "Safety Procedure",
                      label:
                        "Safety Procedure",
                    },
                    {
                      value:
                        "Shelter",
                      label:
                        "Shelter",
                    },
                    {
                      value:
                        "Emergency Notice",
                      label:
                        "Emergency Notice",
                    },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                label="Location"
                name="location"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter the location.",
                  },
                ]}
              >
                <Input
                  placeholder="e.g. Nowshera"
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                label="Emergency Contact"
                name="contact"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter a contact number or N/A.",
                  },
                ]}
              >
                <Input
                  prefix={
                    <PhoneOutlined />
                  }
                  placeholder="e.g. 1122"
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                label="Priority"
                name="priority"
                rules={[
                  {
                    required: true,
                    message:
                      "Please select priority.",
                  },
                ]}
              >
                <Select
                  options={[
                    {
                      value:
                        "Critical",
                      label:
                        "Critical",
                    },
                    {
                      value:
                        "High",
                      label:
                        "High",
                    },
                    {
                      value:
                        "Medium",
                      label:
                        "Medium",
                    },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                label="Publication Status"
                name="status"
                rules={[
                  {
                    required: true,
                    message:
                      "Please select status.",
                  },
                ]}
              >
                <Select
                  options={[
                    {
                      value:
                        "Published",
                      label:
                        "Published",
                    },
                    {
                      value:
                        "Draft",
                      label:
                        "Draft",
                    },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Emergency Information"
                name="description"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter emergency information.",
                  },
                ]}
              >
                <TextArea
                  rows={5}
                  placeholder="Enter emergency instructions, safety procedures, evacuation information, or other critical public information."
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default EmergencyInformation;