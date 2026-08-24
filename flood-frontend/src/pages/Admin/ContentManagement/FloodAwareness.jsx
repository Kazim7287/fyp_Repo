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
  Statistic,
  Divider,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

/* =========================================================
   INITIAL FLOOD AWARENESS DATA
========================================================= */

const initialAwarenessData = [
  {
    id: 1,
    title: "What To Do Before a Flood",
    category: "Preparedness",
    description:
      "Essential steps households should take before flooding occurs, including emergency kits and evacuation planning.",
    audience: "General Public",
    priority: "High",
    status: "Published",
  },

  {
    id: 2,
    title: "Flood Safety During Heavy Rainfall",
    category: "Safety Guide",
    description:
      "Safety instructions for residents during periods of heavy rainfall and rapidly increasing water levels.",
    audience: "General Public",
    priority: "Critical",
    status: "Published",
  },

  {
    id: 3,
    title: "Evacuation and Safe Routes",
    category: "Evacuation",
    description:
      "Guidelines explaining how residents should respond to evacuation warnings and identify safe routes.",
    audience: "Residents",
    priority: "Critical",
    status: "Published",
  },

  {
    id: 4,
    title: "Understanding Flood Warning Levels",
    category: "Education",
    description:
      "Explanation of Normal, Warning, and Critical flood-risk levels used by the monitoring system.",
    audience: "General Public",
    priority: "Medium",
    status: "Draft",
  },

  {
    id: 5,
    title: "Emergency Preparedness Checklist",
    category: "Preparedness",
    description:
      "A practical checklist covering emergency supplies, documents, communication, and evacuation preparation.",
    audience: "Households",
    priority: "High",
    status: "Published",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const FloodAwareness = () => {
  const [data, setData] = useState(
    initialAwarenessData
  );

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingRecord, setEditingRecord] =
    useState(null);

  const [viewRecord, setViewRecord] =
    useState(null);

  const [form] = Form.useForm();

  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreate = () => {
    setEditingRecord(null);

    form.resetFields();

    form.setFieldsValue({
      status: "Draft",
      priority: "Medium",
    });

    setModalOpen(true);
  };

  /* =======================================================
     EDIT
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
      prev.filter(
        (item) => item.id !== id
      )
    );

    message.success(
      "Flood awareness content deleted successfully."
    );
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSubmit = async () => {
    try {
      const values =
        await form.validateFields();

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
          "Flood awareness content updated successfully."
        );
      } else {
        const newRecord = {
          id: Date.now(),
          ...values,
        };

        setData((prev) => [
          ...prev,
          newRecord,
        ]);

        message.success(
          "Flood awareness content created successfully."
        );
      }

      setModalOpen(false);

      form.resetFields();

      setEditingRecord(null);
    } catch (error) {
      // Ant Design handles validation errors.
    }
  };

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = [
    {
      title: "Awareness Content",
      dataIndex: "title",
      key: "title",

      render: (value, record) => (
        <Space align="start">
          <BookOutlined
            style={{
              marginTop: 4,
              color:
                record.priority ===
                "Critical"
                  ? "#ff4d4f"
                  : "#1677ff",
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
      title: "Audience",
      dataIndex: "audience",
      key: "audience",

      render: (value) => (
        <Space>
          <GlobalOutlined />

          <span>{value}</span>
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
            icon={<EyeOutlined />}
            onClick={() =>
              setViewRecord(record)
            }
          >
            View
          </Button>

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
            title="Delete this awareness content?"
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

  const preparedness = data.filter(
    (item) =>
      item.category ===
      "Preparedness"
  ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div>

      {/* =================================================
          HEADER
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
            Flood Awareness
          </Title>

          <Text type="secondary">
            Manage flood preparedness guides,
            safety instructions, evacuation
            information, and public education
            material.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Add Awareness Content
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
              title="Total Content"
              value={total}
              prefix={
                <BookOutlined />
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
                <FileTextOutlined />
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
              title="Critical Guides"
              value={critical}
              prefix={
                <SafetyCertificateOutlined />
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
              title="Preparedness"
              value={preparedness}
              prefix={
                <GlobalOutlined />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* =================================================
          CONTENT TABLE
      ================================================= */}

      <Card
        title={
          <Space>
            <BookOutlined />

            <span>
              Flood Awareness Content
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
            ? "Edit Flood Awareness Content"
            : "Add Flood Awareness Content"
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
        width={750}
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
                label="Content Title"
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
                  placeholder="e.g. What To Do Before a Flood"
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
                        "Preparedness",
                      label:
                        "Preparedness",
                    },
                    {
                      value:
                        "Safety Guide",
                      label:
                        "Safety Guide",
                    },
                    {
                      value:
                        "Evacuation",
                      label:
                        "Evacuation",
                    },
                    {
                      value:
                        "Education",
                      label:
                        "Education",
                    },
                    {
                      value:
                        "Recovery",
                      label:
                        "Recovery",
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
                label="Target Audience"
                name="audience"
                rules={[
                  {
                    required: true,
                    message:
                      "Please select an audience.",
                  },
                ]}
              >
                <Select
                  placeholder="Select audience"
                  options={[
                    {
                      value:
                        "General Public",
                      label:
                        "General Public",
                    },
                    {
                      value:
                        "Residents",
                      label:
                        "Residents",
                    },
                    {
                      value:
                        "Households",
                      label:
                        "Households",
                    },
                    {
                      value:
                        "Students",
                      label:
                        "Students",
                    },
                    {
                      value:
                        "Emergency Responders",
                      label:
                        "Emergency Responders",
                    },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={6}
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
              md={6}
            >
              <Form.Item
                label="Status"
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
                label="Awareness Content"
                name="description"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter the awareness content.",
                  },
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Write flood preparedness instructions, safety guidelines, evacuation information, or educational content..."
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* =================================================
          VIEW MODAL
      ================================================= */}

      <Modal
        title={
          viewRecord?.title ||
          "Flood Awareness"
        }
        open={!!viewRecord}
        footer={null}
        onCancel={() =>
          setViewRecord(null)
        }
        width={750}
      >
        {viewRecord && (
          <div>
            <Space
              wrap
              style={{
                marginBottom: 16,
              }}
            >
              <Tag color="blue">
                {viewRecord.category}
              </Tag>

              <Tag
                color={
                  viewRecord.priority ===
                  "Critical"
                    ? "error"
                    : "warning"
                }
              >
                {viewRecord.priority}
              </Tag>

              <Tag
                color={
                  viewRecord.status ===
                  "Published"
                    ? "success"
                    : "default"
                }
              >
                {viewRecord.status}
              </Tag>
            </Space>

            <Divider />

            <Paragraph>
              {viewRecord.description}
            </Paragraph>

            <Divider />

            <Text type="secondary">
              Target Audience
            </Text>

            <br />

            <Text strong>
              {viewRecord.audience}
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FloodAwareness;