
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";

import {
  BellOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import {
  fetchAnnouncements,
  fetchAnnouncementStats,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  updateAnnouncementStatus,
  selectAnnouncements,
  selectAnnouncementStats,
  selectAnnouncementLoading,
  selectAnnouncementStatsLoading,
  selectAnnouncementMutationLoading,
  selectAnnouncementError,
  selectAnnouncementStatsError,
} from "../../../store/slices/announcementSlice";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const categoryOptions = [
  { value: "System Update", label: "System Update" },
  { value: "Weather Advisory", label: "Weather Advisory" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Emergency", label: "Emergency" },
  { value: "General", label: "General" },
];

const priorityOptions = [
  { value: "Critical", label: "Critical" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

const statusOptions = [
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
  { value: "Archived", label: "Archived" },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Published":
      return "green";
    case "Draft":
      return "orange";
    case "Archived":
      return "default";
    default:
      return "default";
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "Critical":
      return "red";
    case "High":
      return "orange";
    case "Medium":
      return "blue";
    case "Low":
      return "green";
    default:
      return "default";
  }
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const parsed = dayjs(value);

  if (!parsed.isValid()) {
    return "—";
  }

  return parsed.format("DD MMM YYYY, hh:mm A");
};

const normalizeAnnouncementForForm = (announcement) => {
  if (!announcement) {
    return {};
  }

  return {
    title: announcement.title || "",
    category: announcement.category || "General",
    priority: announcement.priority || "Medium",
    status: announcement.status || "Draft",
    publishedAt: announcement.published_at
      ? dayjs(announcement.published_at)
      : announcement.publishedAt
        ? dayjs(announcement.publishedAt)
        : null,
    expiresAt: announcement.expires_at
      ? dayjs(announcement.expires_at)
      : announcement.expiresAt
        ? dayjs(announcement.expiresAt)
        : null,
    content: announcement.content || "",
  };
};

const normalizeAnnouncementForApi = (values) => {
  return {
    title: values.title?.trim() || "",
    category: values.category,
    priority: values.priority,
    status: values.status,
    published_at: values.publishedAt
      ? values.publishedAt.format("YYYY-MM-DD HH:mm:ss")
      : null,
    expires_at: values.expiresAt
      ? values.expiresAt.format("YYYY-MM-DD HH:mm:ss")
      : null,
    content: values.content?.trim() || "",
  };
};

const Announcements = () => {
  const dispatch = useDispatch();

  const announcements = useSelector(selectAnnouncements);
  const stats = useSelector(selectAnnouncementStats);

  const loading = useSelector(selectAnnouncementLoading);
  const statsLoading = useSelector(selectAnnouncementStatsLoading);
  const mutationLoading = useSelector(selectAnnouncementMutationLoading);

  const error = useSelector(selectAnnouncementError);
  const statsError = useSelector(selectAnnouncementStatsError);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [viewAnnouncement, setViewAnnouncement] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAnnouncements());
    dispatch(fetchAnnouncementStats());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAnnouncements());
    dispatch(fetchAnnouncementStats());
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);

    form.resetFields();

    form.setFieldsValue({
      category: "General",
      priority: "Medium",
      status: "Draft",
      publishedAt: null,
      expiresAt: null,
    });

    setModalOpen(true);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);

    form.setFieldsValue(
      normalizeAnnouncementForForm(announcement)
    );

    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload = normalizeAnnouncementForApi(values);

      if (editingAnnouncement) {
        await dispatch(
          updateAnnouncement({
            id: editingAnnouncement.id,
            announcementData: payload,
          })
        ).unwrap();

        message.success("Announcement updated successfully.");
      } else {
        await dispatch(
          createAnnouncement(payload)
        ).unwrap();

        message.success("Announcement created successfully.");
      }

      setModalOpen(false);
      setEditingAnnouncement(null);
      form.resetFields();

      dispatch(fetchAnnouncements());
      dispatch(fetchAnnouncementStats());
    } catch (err) {
      if (err?.errorFields) {
        return;
      }

      message.error(
        err?.message ||
          err ||
          "Failed to save announcement."
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteAnnouncement(id)).unwrap();

      message.success("Announcement deleted successfully.");

      dispatch(fetchAnnouncements());
      dispatch(fetchAnnouncementStats());
    } catch (err) {
      message.error(
        err?.message ||
          err ||
          "Failed to delete announcement."
      );
    }
  };

  const handleStatusChange = async (announcement, status) => {
    if (!announcement?.id) {
      return;
    }

    try {
      await dispatch(
        updateAnnouncementStatus({
          id: announcement.id,
          status,
        })
      ).unwrap();

      message.success(
        `Announcement status changed to ${status}.`
      );

      dispatch(fetchAnnouncements());
      dispatch(fetchAnnouncementStats());
    } catch (err) {
      message.error(
        err?.message ||
          err ||
          "Failed to update announcement status."
      );
    }
  };

  const totalAnnouncements =
    Number(stats?.total_announcements) ||
    announcements.length ||
    0;

  const publishedAnnouncements =
    Number(stats?.published_announcements) || 0;

  const draftAnnouncements =
    Number(stats?.draft_announcements) || 0;

  const highPriorityAnnouncements =
    Number(stats?.high_priority_announcements) || 0;

  const columns = useMemo(
    () => [
      {
        title: "Announcement",
        key: "announcement",
        width: 320,
        render: (_, record) => (
          <Space
            align="start"
            size={12}
          >
            <Badge
              dot={record.priority === "Critical"}
              status={
                record.priority === "Critical"
                  ? "error"
                  : record.priority === "High"
                    ? "warning"
                    : "default"
              }
            />

            <div>
              <Text strong>
                {record.title || "Untitled Announcement"}
              </Text>

              <br />

              <Text type="secondary">
                {record.category || "General"}
              </Text>
            </div>
          </Space>
        ),
      },

      {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        width: 120,
        render: (priority) => (
          <Tag color={getPriorityColor(priority)}>
            {priority || "Medium"}
          </Tag>
        ),
      },

      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: (status) => (
          <Tag color={getStatusColor(status)}>
            {status || "Draft"}
          </Tag>
        ),
      },

      {
        title: "Published",
        key: "published_at",
        width: 180,
        render: (_, record) =>
          formatDate(
            record.published_at ||
              record.publishedAt
          ),
      },

      {
        title: "Author",
        key: "author",
        width: 140,
        render: (_, record) => {
          if (
            record.author_name ||
            record.authorName
          ) {
            return (
              <Text>
                {record.author_name ||
                  record.authorName}
              </Text>
            );
          }

          if (record.author_id) {
            return (
              <Text>
                User #{record.author_id}
              </Text>
            );
          }

          return (
            <Text type="secondary">
              Administrator
            </Text>
          );
        },
      },

      {
        title: "Actions",
        key: "actions",
        width: 190,
        fixed: "right",
        render: (_, record) => (
          <Space size="small">
            <Tooltip title="View">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() =>
                  setViewAnnouncement(record)
                }
              />
            </Tooltip>

            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() =>
                  handleEdit(record)
                }
              />
            </Tooltip>

            <Popconfirm
              title="Delete announcement?"
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
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div
      style={{
        padding: 24,
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              margin: 0,
            }}
          >
            Announcement Management
          </Title>

          <Text type="secondary">
            Create, manage and publish system announcements.
          </Text>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading || statsLoading}
          >
            Refresh
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Create Announcement
          </Button>
        </Space>
      </div>

      {/* =====================================================
          API ERRORS
      ===================================================== */}

      {error && (
        <Alert
          type="error"
          showIcon
          closable
          message="Failed to load announcements"
          description={error}
          style={{
            marginBottom: 16,
          }}
        />
      )}

      {statsError && (
        <Alert
          type="warning"
          showIcon
          closable
          message="Failed to load announcement statistics"
          description={statsError}
          style={{
            marginBottom: 16,
          }}
        />
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

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
              title="Total Announcements"
              value={totalAnnouncements}
              prefix={<BellOutlined />}
              loading={statsLoading}
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
              value={publishedAnnouncements}
              prefix={<BellOutlined />}
              loading={statsLoading}
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
              title="Drafts"
              value={draftAnnouncements}
              prefix={<EditOutlined />}
              loading={statsLoading}
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
              title="High Priority"
              value={highPriorityAnnouncements}
              prefix={<WarningOutlined />}
              loading={statsLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={announcements}
          loading={loading}
          scroll={{
            x: 1100,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} announcements`,
          }}
          locale={{
            emptyText: (
              <Empty
                description="No announcements found"
              />
            ),
          }}
        />
      </Card>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      <Modal
        title={
          editingAnnouncement
            ? "Edit Announcement"
            : "Create Announcement"
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingAnnouncement(null);
          form.resetFields();
        }}
        onOk={handleSave}
        okText={
          editingAnnouncement
            ? "Update"
            : "Create"
        }
        confirmLoading={mutationLoading}
        width={720}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[
              {
                required: true,
                message:
                  "Please enter announcement title.",
              },
              {
                max: 150,
                message:
                  "Title cannot exceed 150 characters.",
              },
            ]}
          >
            <Input
              placeholder="Enter announcement title"
              maxLength={150}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
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
                  options={categoryOptions}
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={8}
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
                  placeholder="Select priority"
                  options={priorityOptions}
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={8}
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
                  placeholder="Select status"
                  options={statusOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                label="Published At"
                name="publishedAt"
              >
                <DatePicker
                  style={{
                    width: "100%",
                  }}
                  showTime
                  format="DD MMM YYYY, hh:mm A"
                  placeholder="Select publish date"
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                label="Expires At"
                name="expiresAt"
              >
                <DatePicker
                  style={{
                    width: "100%",
                  }}
                  showTime
                  format="DD MMM YYYY, hh:mm A"
                  placeholder="Select expiry date"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Content"
            name="content"
            rules={[
              {
                required: true,
                message:
                  "Please enter announcement content.",
              },
            ]}
          >
            <TextArea
              rows={7}
              placeholder="Write announcement content..."
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      <Modal
        title="Announcement Details"
        open={Boolean(viewAnnouncement)}
        onCancel={() =>
          setViewAnnouncement(null)
        }
        footer={[
          <Button
            key="close"
            onClick={() =>
              setViewAnnouncement(null)
            }
          >
            Close
          </Button>,

          viewAnnouncement && (
            <Button
              key="edit"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                handleEdit(viewAnnouncement);
                setViewAnnouncement(null);
              }}
            >
              Edit
            </Button>
          ),
        ]}
        width={760}
      >
        {viewAnnouncement && (
          <>
            <Descriptions
              bordered
              column={{
                xs: 1,
                sm: 2,
              }}
              style={{
                marginBottom: 24,
              }}
            >
              <Descriptions.Item label="Title">
                {viewAnnouncement.title || "—"}
              </Descriptions.Item>

              <Descriptions.Item label="Category">
                {viewAnnouncement.category || "—"}
              </Descriptions.Item>

              <Descriptions.Item label="Priority">
                <Tag
                  color={getPriorityColor(
                    viewAnnouncement.priority
                  )}
                >
                  {viewAnnouncement.priority ||
                    "Medium"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <Tag
                  color={getStatusColor(
                    viewAnnouncement.status
                  )}
                >
                  {viewAnnouncement.status ||
                    "Draft"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Published At">
                {formatDate(
                  viewAnnouncement.published_at ||
                    viewAnnouncement.publishedAt
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Expires At">
                {formatDate(
                  viewAnnouncement.expires_at ||
                    viewAnnouncement.expiresAt
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Author">
                {viewAnnouncement.author_name ||
                viewAnnouncement.authorName
                  ? viewAnnouncement.author_name ||
                    viewAnnouncement.authorName
                  : viewAnnouncement.author_id
                    ? `User #${viewAnnouncement.author_id}`
                    : "Administrator"}
              </Descriptions.Item>

              <Descriptions.Item label="Created At">
                {formatDate(
                  viewAnnouncement.created_at ||
                    viewAnnouncement.createdAt
                )}
              </Descriptions.Item>
            </Descriptions>

            <Card
              size="small"
              title="Content"
            >
              <Paragraph
                style={{
                  marginBottom: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {viewAnnouncement.content ||
                  "No content available."}
              </Paragraph>
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Announcements;
