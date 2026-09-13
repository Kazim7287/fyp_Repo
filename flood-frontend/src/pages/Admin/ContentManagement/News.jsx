import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";

import {
  createNews,
  deleteNews,
  fetchNews,
  fetchNewsStats,
  selectNews,
  selectNewsError,
  selectNewsLoading,
  selectNewsMutationError,
  selectNewsMutationLoading,
  selectNewsStats,
  updateNews,
  updateNewsFeatured,
  updateNewsStatus,
} from "../../../store/slices/newsSlice";

// =========================================================
// CONSTANTS
// =========================================================

const CATEGORY_OPTIONS = [
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
];

const STATUS_OPTIONS = [
  {
    label: "Published",
    value: "Published",
  },
  {
    label: "Draft",
    value: "Draft",
  },
];

// =========================================================
// HELPERS
// =========================================================

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusTag = (status) => {
  if (status === "Published") {
    return (
      <Tag color="green">
        Published
      </Tag>
    );
  }

  return (
    <Tag color="orange">
      Draft
    </Tag>
  );
};

const getCategoryTag = (category) => {
  const colors = {
    "Project Update": "blue",
    Infrastructure: "purple",
    Technology: "cyan",
    Awareness: "gold",
  };

  return (
    <Tag color={colors[category] || "default"}>
      {category || "General"}
    </Tag>
  );
};

// =========================================================
// COMPONENT
// =========================================================

const News = () => {
  const dispatch = useDispatch();

  // =======================================================
  // REDUX
  // =======================================================

  const news = useSelector(selectNews);
  const stats = useSelector(selectNewsStats);

  const loading = useSelector(
    selectNewsLoading
  );

  const mutationLoading = useSelector(
    selectNewsMutationLoading
  );

  const newsError = useSelector(
    selectNewsError
  );

  const mutationError = useSelector(
    selectNewsMutationError
  );

  // =======================================================
  // LOCAL STATE
  // =======================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState(undefined);

  const [categoryFilter, setCategoryFilter] =
    useState(undefined);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [isPreviewOpen, setIsPreviewOpen] =
    useState(false);

  const [editingNews, setEditingNews] =
    useState(null);

  const [previewNews, setPreviewNews] =
    useState(null);

  const [form] = Form.useForm();

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadNews();
    loadStats();
  }, []);

  // =======================================================
  // LOAD NEWS
  // =======================================================

  const loadNews = () => {
    const params = {};

    if (statusFilter) {
      params.status = statusFilter;
    }

    if (categoryFilter) {
      params.category = categoryFilter;
    }

    if (search.trim()) {
      params.search = search.trim();
    }

    dispatch(fetchNews(params));
  };

  // =======================================================
  // LOAD STATS
  // =======================================================

  const loadStats = () => {
    dispatch(fetchNewsStats());
  };

  // =======================================================
  // FILTER HANDLERS
  // =======================================================

  const handleSearch = () => {
    loadNews();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter(undefined);
    setCategoryFilter(undefined);

    dispatch(
      fetchNews({})
    );
  };

  // =======================================================
  // LOCAL FILTER
  // =======================================================
  //
  // Backend filtering is already applied.
  // This additional filter keeps the table responsive
  // while the user is working with the loaded data.
  //
  // =======================================================

  const filteredNews = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return news.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.title
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        item.description
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        item.category
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        !statusFilter ||
        item.status === statusFilter;

      const matchesCategory =
        !categoryFilter ||
        item.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    news,
    search,
    statusFilter,
    categoryFilter,
  ]);

  // =======================================================
  // OPEN CREATE MODAL
  // =======================================================

  const handleCreate = () => {
    setEditingNews(null);

    form.resetFields();

    form.setFieldsValue({
      status: "Draft",
      featured: false,
    });

    setIsModalOpen(true);
  };

  // =======================================================
  // OPEN EDIT MODAL
  // =======================================================

  const handleEdit = (record) => {
    setEditingNews(record);

    form.setFieldsValue({
      title: record.title,
      category: record.category,
      description: record.description,
      status: record.status || "Draft",
      featured: Boolean(record.featured),
      publishedAt:
        record.publishedAt || null,
    });

    setIsModalOpen(true);
  };

  // =======================================================
  // OPEN PREVIEW
  // =======================================================

  const handlePreview = (record) => {
    setPreviewNews(record);
    setIsPreviewOpen(true);
  };

  // =======================================================
  // CLOSE FORM MODAL
  // =======================================================

  const handleCloseModal = () => {
    if (mutationLoading) {
      return;
    }

    setIsModalOpen(false);
    setEditingNews(null);
    form.resetFields();
  };

  // =======================================================
  // SUBMIT FORM
  // =======================================================

  const handleSubmit = async () => {
    try {
      const values =
        await form.validateFields();

      const payload = {
        title: values.title.trim(),
        category: values.category,
        description:
          values.description.trim(),
        status: values.status || "Draft",
        featured:
          Boolean(values.featured),
      };

      // ---------------------------------------------------
      // Published date
      // ---------------------------------------------------

      if (
        values.status === "Published"
      ) {
        payload.published_at =
          editingNews?.publishedAt ||
          editingNews?.published_at ||
          new Date().toISOString();
      } else {
        payload.published_at = null;
      }

      // ---------------------------------------------------
      // UPDATE
      // ---------------------------------------------------

      if (editingNews) {
        const result =
          await dispatch(
            updateNews({
              id: editingNews.id,
              data: payload,
            })
          );

        if (
          updateNews.fulfilled.match(result)
        ) {
          message.success(
            "News updated successfully."
          );

          setIsModalOpen(false);
          setEditingNews(null);
          form.resetFields();

          await Promise.all([
            dispatch(fetchNews({})),
            dispatch(fetchNewsStats()),
          ]);
        }

        return;
      }

      // ---------------------------------------------------
      // CREATE
      // ---------------------------------------------------

      const result =
        await dispatch(
          createNews(payload)
        );

      if (
        createNews.fulfilled.match(result)
      ) {
        message.success(
          "News created successfully."
        );

        setIsModalOpen(false);
        form.resetFields();

        await Promise.all([
          dispatch(fetchNews({})),
          dispatch(fetchNewsStats()),
        ]);
      }
    } catch (error) {
      // Ant Design validation errors are handled
      // automatically by Form.
      if (
        error?.errorFields
      ) {
        return;
      }

      console.error(
        "News form submission error:",
        error
      );
    }
  };

  // =======================================================
  // DELETE NEWS
  // =======================================================

  const handleDelete = async (id) => {
    const result =
      await dispatch(
        deleteNews(id)
      );

    if (
      deleteNews.fulfilled.match(result)
    ) {
      message.success(
        "News deleted successfully."
      );

      await Promise.all([
        dispatch(fetchNews({})),
        dispatch(fetchNewsStats()),
      ]);
    } else {
      message.error(
        result.payload ||
          "Failed to delete news."
      );
    }
  };

  // =======================================================
  // STATUS TOGGLE
  // =======================================================

  const handleStatusChange = async (
    record
  ) => {
    const newStatus =
      record.status === "Published"
        ? "Draft"
        : "Published";

    const result =
      await dispatch(
        updateNewsStatus({
          id: record.id,
          status: newStatus,
        })
      );

    if (
      updateNewsStatus.fulfilled.match(
        result
      )
    ) {
      message.success(
        `News ${
          newStatus === "Published"
            ? "published"
            : "moved to draft"
        } successfully.`
      );

      await Promise.all([
        dispatch(fetchNews({})),
        dispatch(fetchNewsStats()),
      ]);
    } else {
      message.error(
        result.payload ||
          "Failed to update status."
      );
    }
  };

  // =======================================================
  // FEATURED TOGGLE
  // =======================================================

  const handleFeaturedChange = async (
    record,
    featured
  ) => {
    const result =
      await dispatch(
        updateNewsFeatured({
          id: record.id,
          featured,
        })
      );

    if (
      updateNewsFeatured.fulfilled.match(
        result
      )
    ) {
      message.success(
        featured
          ? "News marked as featured."
          : "News removed from featured."
      );

      await Promise.all([
        dispatch(fetchNews({})),
        dispatch(fetchNewsStats()),
      ]);
    } else {
      message.error(
        result.payload ||
          "Failed to update featured status."
      );
    }
  };

  // =======================================================
  // TABLE COLUMNS
  // =======================================================

  const columns = [
    {
      title: "News",
      key: "news",
      width: 350,

      render: (_, record) => (
        <Space
          direction="vertical"
          size={2}
        >
          <Space size={6}>
            {record.featured ? (
              <Tooltip title="Featured">
                <StarFilled />
              </Tooltip>
            ) : null}

            <Typography.Text
              strong
              ellipsis
              style={{
                maxWidth: 300,
                display: "inline-block",
              }}
            >
              {record.title}
            </Typography.Text>
          </Space>

          <Typography.Text
            type="secondary"
            ellipsis
            style={{
              maxWidth: 320,
              display: "inline-block",
            }}
          >
            {record.description}
          </Typography.Text>
        </Space>
      ),
    },

    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 160,

      render: (category) =>
        getCategoryTag(category),
    },

    {
      title: "Author",
      key: "author",
      width: 130,

      render: (_, record) => (
        <Typography.Text>
          {record.authorName ||
            record.author_name ||
            (record.authorId
              ? `User #${record.authorId}`
              : "Administrator")}
        </Typography.Text>
      ),
    },

    {
      title: "Published",
      key: "publishedAt",
      width: 140,

      render: (_, record) =>
        formatDate(
          record.publishedAt
        ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,

      render: (status) =>
        getStatusTag(status),
    },

    {
      title: "Featured",
      key: "featured",
      width: 110,
      align: "center",

      render: (_, record) => (
        <Switch
          checked={Boolean(
            record.featured
          )}
          checkedChildren={
            <StarFilled />
          }
          unCheckedChildren={
            <StarOutlined />
          }
          loading={mutationLoading}
          onChange={(checked) =>
            handleFeaturedChange(
              record,
              checked
            )
          }
        />
      ),
    },

    {
      title: "Actions",
      key: "actions",
      width: 230,

      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Preview">
            <Button
              type="text"
              icon={
                <EyeOutlined />
              }
              onClick={() =>
                handlePreview(record)
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
              onClick={() =>
                handleStatusChange(
                  record
                )
              }
            >
              {record.status ===
              "Published"
                ? "Draft"
                : "Publish"}
            </Button>
          </Tooltip>

          <Popconfirm
            title="Delete this news item?"
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

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div
      style={{
        padding: 24,
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <Row
        justify="space-between"
        align="middle"
        style={{
          marginBottom: 24,
        }}
      >
        <Col>
          <Space
            direction="vertical"
            size={2}
          >
            <Typography.Title
              level={2}
              style={{
                margin: 0,
              }}
            >
              News Management
            </Typography.Title>

            <Typography.Text type="secondary">
              Manage flood forecasting news,
              project updates and awareness
              information.
            </Typography.Text>
          </Space>
        </Col>

        <Col>
          <Button
            type="primary"
            icon={
              <PlusOutlined />
            }
            onClick={handleCreate}
          >
            Add News
          </Button>
        </Col>
      </Row>

      {/* ===================================================
          ERROR
      =================================================== */}

      {newsError ? (
        <Alert
          type="error"
          showIcon
          closable
          message="Failed to load news"
          description={newsError}
          style={{
            marginBottom: 20,
          }}
        />
      ) : null}

      {mutationError ? (
        <Alert
          type="error"
          showIcon
          closable
          message="News operation failed"
          description={
            mutationError
          }
          style={{
            marginBottom: 20,
          }}
        />
      ) : null}

      {/* ===================================================
          STATISTICS
      =================================================== */}

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
              title="Total News"
              value={
                stats.total_news || 0
              }
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
              title="Published"
              value={
                stats.published_news ||
                0
              }
              valueStyle={{
                color: "#3f8600",
              }}
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
              title="Draft"
              value={
                stats.draft_news || 0
              }
              valueStyle={{
                color: "#d48806",
              }}
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
              title="Featured"
              value={
                stats.featured_news ||
                0
              }
              prefix={
                <StarOutlined />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* ===================================================
          FILTERS
      =================================================== */}

      <Card
        style={{
          marginBottom: 20,
        }}
      >
        <Row
          gutter={[
            12,
            12,
          ]}
          align="middle"
        >
          <Col
            xs={24}
            md={8}
            lg={8}
          >
            <Input.Search
              allowClear
              placeholder="Search news..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              onSearch={
                handleSearch
              }
              enterButton="Search"
            />
          </Col>

          <Col
            xs={24}
            sm={12}
            md={5}
          >
            <Select
              allowClear
              placeholder="Filter by status"
              style={{
                width: "100%",
              }}
              value={
                statusFilter
              }
              options={
                STATUS_OPTIONS
              }
              onChange={(value) =>
                setStatusFilter(
                  value
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
              allowClear
              placeholder="Filter by category"
              style={{
                width: "100%",
              }}
              value={
                categoryFilter
              }
              options={
                CATEGORY_OPTIONS
              }
              onChange={(value) =>
                setCategoryFilter(
                  value
                )
              }
            />
          </Col>

          <Col
            xs={24}
            md={6}
          >
            <Space>
              <Button
                onClick={
                  handleSearch
                }
              >
                Apply Filters
              </Button>

              <Button
                onClick={
                  handleClearFilters
                }
              >
                Clear
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ===================================================
          TABLE
      =================================================== */}

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={
            filteredNews
          }
          loading={loading}
          scroll={{
            x: 1250,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (
              total
            ) =>
              `Total ${total} news items`,
          }}
          locale={{
            emptyText:
              "No news found.",
          }}
        />
      </Card>

      {/* ===================================================
          CREATE / EDIT MODAL
      =================================================== */}

      <Modal
        title={
          editingNews
            ? "Edit News"
            : "Create News"
        }
        open={isModalOpen}
        onCancel={
          handleCloseModal
        }
        onOk={handleSubmit}
        okText={
          editingNews
            ? "Update News"
            : "Create News"
        }
        confirmLoading={
          mutationLoading
        }
        width={700}
        destroyOnHidden
      >
        <Divider />

        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            name="title"
            label="News Title"
            rules={[
              {
                required: true,
                message:
                  "Please enter the news title.",
              },
              {
                max: 150,
                message:
                  "Title cannot exceed 150 characters.",
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
              md={12}
            >
              <Form.Item
                name="category"
                label="Category"
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
                  options={
                    CATEGORY_OPTIONS
                  }
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                name="status"
                label="Status"
                rules={[
                  {
                    required: true,
                    message:
                      "Please select a status.",
                  },
                ]}
              >
                <Select
                  options={
                    STATUS_OPTIONS
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                required: true,
                message:
                  "Please enter the news description.",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Write the news description..."
              rows={7}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="featured"
            label="Featured News"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Featured"
              unCheckedChildren="Normal"
            />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            message="Publication date"
            description={
              "When status is Published, the backend will automatically set the publication date. Draft news will not have a publication date."
            }
          />
        </Form>
      </Modal>

      {/* ===================================================
          PREVIEW MODAL
      =================================================== */}

      <Modal
        title="News Preview"
        open={isPreviewOpen}
        onCancel={() =>
          setIsPreviewOpen(false)
        }
        footer={[
          <Button
            key="close"
            onClick={() =>
              setIsPreviewOpen(
                false
              )
            }
          >
            Close
          </Button>,
        ]}
        width={750}
      >
        {previewNews ? (
          <div>
            <Space
              wrap
              style={{
                marginBottom: 12,
              }}
            >
              {getCategoryTag(
                previewNews.category
              )}

              {getStatusTag(
                previewNews.status
              )}

              {previewNews.featured ? (
                <Tag
                  icon={
                    <StarFilled />
                  }
                  color="gold"
                >
                  Featured
                </Tag>
              ) : null}
            </Space>

            <Typography.Title
              level={3}
              style={{
                marginTop: 8,
              }}
            >
              {previewNews.title}
            </Typography.Title>

            <Descriptions
              size="small"
              column={2}
              bordered
            >
              <Descriptions.Item label="Author">
                {previewNews.authorName ||
                  previewNews.author_name ||
                  (previewNews.authorId
                    ? `User #${previewNews.authorId}`
                    : "Administrator")}
              </Descriptions.Item>

              <Descriptions.Item label="Published">
                {formatDate(
                  previewNews.publishedAt
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Created">
                {formatDateTime(
                  previewNews.createdAt
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Updated">
                {formatDateTime(
                  previewNews.updatedAt
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Typography.Paragraph
              style={{
                whiteSpace:
                  "pre-wrap",
                lineHeight: 1.8,
              }}
            >
              {
                previewNews.description
              }
            </Typography.Paragraph>
          </div>
        ) : (
          <Typography.Text type="secondary">
            No news selected.
          </Typography.Text>
        )}
      </Modal>
    </div>
  );
};

export default News;