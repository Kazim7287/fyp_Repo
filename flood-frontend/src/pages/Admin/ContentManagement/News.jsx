import { useMemo, useState } from "react";

import {
  Card,
  Col,
  Row,
  Table,
  Typography,
  Space,
  Button,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  DatePicker,
  Switch,
  Tooltip,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const { TextArea } = Input;

/* =========================================================
   SAMPLE NEWS DATA
========================================================= */

const initialNews = [
  {
    id: 1,
    title: "FloodGuard Early Warning System Prototype Launched",
    category: "Project Update",
    author: "Admin",
    date: "2026-08-18",
    status: "Published",
    featured: true,
    description:
      "The FloodGuard flood early warning system prototype has entered the initial development phase.",
  },

  {
    id: 2,
    title: "New Monitoring Stations Planned for Nowshera",
    category: "Infrastructure",
    author: "Admin",
    date: "2026-08-15",
    status: "Published",
    featured: false,
    description:
      "Additional IoT-based monitoring stations are planned to improve flood monitoring coverage.",
  },

  {
    id: 3,
    title: "AI Flood Forecasting Module Under Development",
    category: "Technology",
    author: "AI Team",
    date: "2026-08-12",
    status: "Draft",
    featured: true,
    description:
      "The AI forecasting module will combine time-series forecasting and flood-risk classification models.",
  },

  {
    id: 4,
    title: "Flood Awareness Campaign",
    category: "Awareness",
    author: "Admin",
    date: "2026-08-10",
    status: "Published",
    featured: false,
    description:
      "FloodGuard is preparing educational material to improve community awareness and preparedness.",
  },
];

/* =========================================================
   STATUS TAG
========================================================= */

const getStatusTag = (status) => {
  if (status === "Published") {
    return (
      <Tag
        icon={<CheckCircleOutlined />}
        color="success"
      >
        Published
      </Tag>
    );
  }

  return (
    <Tag
      icon={<ClockCircleOutlined />}
      color="warning"
    >
      Draft
    </Tag>
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const News = () => {
  const [news, setNews] = useState(initialNews);

  const [searchText, setSearchText] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingNews, setEditingNews] =
    useState(null);

  const [previewNews, setPreviewNews] =
    useState(null);

  const [form] = Form.useForm();

  /* =======================================================
     FILTERED NEWS
  ======================================================= */

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const matchesSearch =
        item.title
          .toLowerCase()
          .includes(
            searchText.toLowerCase()
          ) ||
        item.description
          .toLowerCase()
          .includes(
            searchText.toLowerCase()
          );

      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        item.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    news,
    searchText,
    statusFilter,
    categoryFilter,
  ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalNews = news.length;

  const publishedNews = news.filter(
    (item) =>
      item.status === "Published"
  ).length;

  const draftNews = news.filter(
    (item) =>
      item.status === "Draft"
  ).length;

  const featuredNews = news.filter(
    (item) => item.featured
  ).length;

  /* =======================================================
     OPEN CREATE MODAL
  ======================================================= */

  const handleCreate = () => {
    setEditingNews(null);

    form.resetFields();

    setModalOpen(true);
  };

  /* =======================================================
     OPEN EDIT MODAL
  ======================================================= */

  const handleEdit = (record) => {
    setEditingNews(record);

    form.setFieldsValue({
      title: record.title,
      category: record.category,
      description: record.description,
      status: record.status,
      featured: record.featured,
    });

    setModalOpen(true);
  };

  /* =======================================================
     SAVE NEWS
  ======================================================= */

  const handleSave = async () => {
    try {
      const values =
        await form.validateFields();

      if (editingNews) {
        setNews((previous) =>
          previous.map((item) =>
            item.id === editingNews.id
              ? {
                  ...item,
                  title: values.title,
                  category:
                    values.category,
                  description:
                    values.description,
                  status: values.status,
                  featured:
                    values.featured || false,
                }
              : item
          )
        );

        message.success(
          "News updated successfully"
        );
      } else {
        const newNews = {
          id: Date.now(),

          title: values.title,

          category:
            values.category,

          author: "Admin",

          date: new Date()
            .toISOString()
            .split("T")[0],

          status:
            values.status || "Draft",

          featured:
            values.featured || false,

          description:
            values.description,
        };

        setNews((previous) => [
          newNews,
          ...previous,
        ]);

        message.success(
          "News created successfully"
        );
      }

      setModalOpen(false);

      form.resetFields();

      setEditingNews(null);
    } catch (error) {
      // Validation error
    }
  };

  /* =======================================================
     DELETE NEWS
  ======================================================= */

  const handleDelete = (id) => {
    setNews((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    message.success(
      "News deleted successfully"
    );
  };

  /* =======================================================
     TOGGLE PUBLISH STATUS
  ======================================================= */

  const toggleStatus = (record) => {
    const newStatus =
      record.status === "Published"
        ? "Draft"
        : "Published";

    setNews((previous) =>
      previous.map((item) =>
        item.id === record.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    message.success(
      newStatus === "Published"
        ? "News published"
        : "News moved to draft"
    );
  };

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = [
    {
      title: "News",
      key: "title",
      width: 330,

      render: (_, record) => (
        <Space
          align="start"
          size={12}
        >
          <FileTextOutlined
            style={{
              fontSize: 20,
              marginTop: 3,
              color: "#1677ff",
            }}
          />

          <div>
            <Space size={6}>
              <Text strong>
                {record.title}
              </Text>

              {record.featured && (
                <Tooltip title="Featured News">
                  <StarOutlined
                    style={{
                      color: "#faad14",
                    }}
                  />
                </Tooltip>
              )}
            </Space>

            <br />

            <Text
              type="secondary"
              style={{
                fontSize: 12,
              }}
            >
              {record.description}
            </Text>
          </div>
        </Space>
      ),
    },

    {
      title: "Category",
      dataIndex: "category",
      key: "category",

      render: (value) => (
        <Tag color="blue">
          {value}
        </Tag>
      ),
    },

    {
      title: "Author",
      dataIndex: "author",
      key: "author",
    },

    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",

      render: (value) =>
        getStatusTag(value),
    },

    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 180,

      render: (_, record) => (
        <Space>
          <Tooltip title="Preview">
            <Button
              type="text"
              icon={
                <EyeOutlined />
              }
              onClick={() =>
                setPreviewNews(record)
              }
            />
          </Tooltip>

          <Tooltip title="Edit">
            <Button
              type="text"
              icon={
                <EditOutlined />
              }
              onClick={() =>
                handleEdit(record)
              }
            />
          </Tooltip>

          <Tooltip
            title={
              record.status ===
              "Published"
                ? "Move to Draft"
                : "Publish"
            }
          >
            <Button
              type="text"
              icon={
                record.status ===
                "Published" ? (
                  <ClockCircleOutlined />
                ) : (
                  <CheckCircleOutlined />
                )
              }
              onClick={() =>
                toggleStatus(record)
              }
            />
          </Tooltip>

          <Popconfirm
            title="Delete this news?"
            description="This action cannot be undone."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{
              danger: true,
            }}
            onConfirm={() =>
              handleDelete(record.id)
            }
            icon={
              <ExclamationCircleOutlined />
            }
          >
            <Tooltip title="Delete">
              <Button
                danger
                type="text"
                icon={
                  <DeleteOutlined />
                }
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
              margin: 0,
            }}
          >
            News Management
          </Title>

          <Text type="secondary">
            Create, manage, publish, and
            organize FloodGuard news and
            project updates.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Create News
        </Button>
      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

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
            <Text type="secondary">
              Total News
            </Text>

            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                marginTop: 6,
              }}
            >
              {totalNews}
            </div>
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Text type="secondary">
              Published
            </Text>

            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                marginTop: 6,
              }}
            >
              {publishedNews}
            </div>
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Text type="secondary">
              Drafts
            </Text>

            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                marginTop: 6,
              }}
            >
              {draftNews}
            </div>
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Text type="secondary">
              Featured
            </Text>

            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                marginTop: 6,
              }}
            >
              {featuredNews}
            </div>
          </Card>
        </Col>
      </Row>

      {/* =================================================
          NEWS TABLE
      ================================================= */}

      <Card
        title={
          <Space>
            <FileTextOutlined />

            <span>
              News Articles
            </span>
          </Space>
        }
      >

        {/* FILTERS */}

        <Row
          gutter={[12, 12]}
          style={{
            marginBottom: 20,
          }}
        >
          <Col
            xs={24}
            md={10}
          >
            <Input
              allowClear
              prefix={
                <SearchOutlined />
              }
              placeholder="Search news..."
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
            />
          </Col>

          <Col
            xs={24}
            sm={12}
            md={5}
          >
            <Select
              style={{
                width: "100%",
              }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                {
                  label: "All Status",
                  value: "all",
                },
                {
                  label: "Published",
                  value: "Published",
                },
                {
                  label: "Draft",
                  value: "Draft",
                },
              ]}
            />
          </Col>

          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <Select
              style={{
                width: "100%",
              }}
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                {
                  label: "All Categories",
                  value: "all",
                },
                {
                  label: "Project Update",
                  value: "Project Update",
                },
                {
                  label: "Infrastructure",
                  value: "Infrastructure",
                },
                {
                  label: "Technology",
                  value: "Technology",
                },
                {
                  label: "Awareness",
                  value: "Awareness",
                },
              ]}
            />
          </Col>

          <Col
            xs={24}
            md={3}
          >
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchText("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              block
            >
              Reset
            </Button>
          </Col>
        </Row>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredNews}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showTotal: (total) =>
              `Total ${total} news`,
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
          editingNews
            ? "Edit News"
            : "Create News"
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingNews(null);
        }}
        onOk={handleSave}
        okText={
          editingNews
            ? "Update News"
            : "Create News"
        }
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >

          <Form.Item
            label="News Title"
            name="title"
            rules={[
              {
                required: true,
                message:
                  "Please enter the news title",
              },
            ]}
          >
            <Input
              placeholder="Enter news title"
              maxLength={150}
              showCount
            />
          </Form.Item>

          <Row
            gutter={16}
          >
            <Col
              xs={24}
              sm={12}
            >
              <Form.Item
                label="Category"
                name="category"
                rules={[
                  {
                    required: true,
                    message:
                      "Please select a category",
                  },
                ]}
              >
                <Select
                  placeholder="Select category"
                  options={[
                    {
                      label:
                        "Project Update",
                      value:
                        "Project Update",
                    },
                    {
                      label:
                        "Infrastructure",
                      value:
                        "Infrastructure",
                    },
                    {
                      label:
                        "Technology",
                      value:
                        "Technology",
                    },
                    {
                      label:
                        "Awareness",
                      value:
                        "Awareness",
                    },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              sm={12}
            >
              <Form.Item
                label="Status"
                name="status"
                initialValue="Draft"
              >
                <Select
                  options={[
                    {
                      label: "Draft",
                      value: "Draft",
                    },
                    {
                      label:
                        "Published",
                      value:
                        "Published",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="News Content"
            name="description"
            rules={[
              {
                required: true,
                message:
                  "Please enter news content",
              },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Write the news content..."
              maxLength={2000}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Featured News"
            name="featured"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Featured"
              unCheckedChildren="Normal"
            />
          </Form.Item>

        </Form>
      </Modal>

      {/* =================================================
          PREVIEW MODAL
      ================================================= */}

      <Modal
        title="News Preview"
        open={!!previewNews}
        onCancel={() =>
          setPreviewNews(null)
        }
        footer={null}
        width={750}
      >
        {previewNews && (
          <div>

            <Space
              style={{
                marginBottom: 12,
              }}
            >
              <Tag color="blue">
                {previewNews.category}
              </Tag>

              {getStatusTag(
                previewNews.status
              )}

              {previewNews.featured && (
                <Tag
                  icon={<StarOutlined />}
                  color="gold"
                >
                  Featured
                </Tag>
              )}
            </Space>

            <Title
              level={2}
              style={{
                marginTop: 8,
              }}
            >
              {previewNews.title}
            </Title>

            <Text type="secondary">
              Published by{" "}
              <strong>
                {previewNews.author}
              </strong>{" "}
              • {previewNews.date}
            </Text>

            <div
              style={{
                marginTop: 24,
                lineHeight: 1.8,
              }}
            >
              {previewNews.description}
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};

export default News;