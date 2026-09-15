import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
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
  PlusOutlined,
  QuestionCircleOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";

import {
  fetchFAQs,
  fetchFAQStats,
  addFAQ,
  editFAQ,
  removeFAQ,
  changeFAQStatus,
  changeFAQFeatured,
  selectFAQs,
  selectFAQStats,
  selectFAQLoading,
  selectFAQStatsLoading,
  selectFAQActionLoading,
  selectFAQError,
} from "../../../store/slices/faqSlice";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// =========================================================
// CONSTANTS
// =========================================================

const categories = [
  "General",
  "Monitoring",
  "AI & Forecasting",
  "Emergency",
  "Sensors",
  "Alerts",
];

// =========================================================
// COMPONENT
// =========================================================

const FAQManagement = () => {
  const dispatch = useDispatch();

  const faqs = useSelector(selectFAQs);
  const stats = useSelector(selectFAQStats);
  const loading = useSelector(selectFAQLoading);
  const statsLoading = useSelector(selectFAQStatsLoading);
  const actionLoading = useSelector(selectFAQActionLoading);
  const error = useSelector(selectFAQError);

  const [messageApi, contextHolder] = message.useMessage();

  // =======================================================
  // LOCAL UI STATE
  // =======================================================

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);

  const [previewFAQ, setPreviewFAQ] = useState(null);

  const [form] = Form.useForm();

  // =======================================================
  // INITIAL DATA
  // =======================================================

  useEffect(() => {
    dispatch(fetchFAQs());
    dispatch(fetchFAQStats());
  }, [dispatch]);

  // =======================================================
  // CLIENT-SIDE FILTERING
  // =======================================================

  const filteredFAQs = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesSearch =
        !search ||
        faq.question?.toLowerCase().includes(search) ||
        faq.answer?.toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter === "all" ||
        faq.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchText, categoryFilter]);

  // =======================================================
  // OPEN CREATE MODAL
  // =======================================================

  const handleCreate = () => {
    setEditingFAQ(null);

    form.resetFields();

    form.setFieldsValue({
      status: "Draft",
      featured: false,
      display_order: faqs.length + 1,
    });

    setIsModalOpen(true);
  };

  // =======================================================
  // OPEN EDIT MODAL
  // =======================================================

  const handleEdit = (faq) => {
    setEditingFAQ(faq);

    form.setFieldsValue({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      status: faq.status,
      featured: faq.featured,
      display_order: faq.display_order,
    });

    setIsModalOpen(true);
  };

  // =======================================================
  // CLOSE MODAL
  // =======================================================

  const handleCancel = () => {
    if (actionLoading) return;

    setIsModalOpen(false);
    setEditingFAQ(null);
    form.resetFields();
  };

  // =======================================================
  // SUBMIT FORM
  // =======================================================

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const faqData = {
        question: values.question.trim(),
        answer: values.answer.trim(),
        category: values.category,
        status: values.status,
        featured: Boolean(values.featured),
        display_order: Number(values.display_order),
      };

      if (editingFAQ) {
        await dispatch(
          editFAQ({
            id: editingFAQ.id,
            faqData,
          })
        ).unwrap();

        messageApi.success("FAQ updated successfully.");
      } else {
        await dispatch(addFAQ(faqData)).unwrap();

        messageApi.success("FAQ created successfully.");
      }

      setIsModalOpen(false);
      setEditingFAQ(null);
      form.resetFields();

      dispatch(fetchFAQs());
      dispatch(fetchFAQStats());
    } catch (error) {
      if (error?.errorFields) {
        return;
      }

      messageApi.error(
        typeof error === "string"
          ? error
          : "Failed to save FAQ."
      );
    }
  };

  // =======================================================
  // DELETE FAQ
  // =======================================================

  const handleDelete = async (id) => {
    try {
      await dispatch(removeFAQ(id)).unwrap();

      messageApi.success("FAQ deleted successfully.");

      dispatch(fetchFAQStats());
    } catch (error) {
      messageApi.error(
        typeof error === "string"
          ? error
          : "Failed to delete FAQ."
      );
    }
  };

  // =======================================================
  // STATUS CHANGE
  // =======================================================

  const handleStatusChange = async (faq, checked) => {
    const newStatus = checked ? "Published" : "Draft";

    try {
      await dispatch(
        changeFAQStatus({
          id: faq.id,
          status: newStatus,
        })
      ).unwrap();

      messageApi.success(
        `FAQ ${newStatus.toLowerCase()} successfully.`
      );

      dispatch(fetchFAQStats());
    } catch (error) {
      messageApi.error(
        typeof error === "string"
          ? error
          : "Failed to update FAQ status."
      );
    }
  };

  // =======================================================
  // FEATURED CHANGE
  // =======================================================

  const handleFeaturedChange = async (faq, checked) => {
    try {
      await dispatch(
        changeFAQFeatured({
          id: faq.id,
          featured: checked,
        })
      ).unwrap();

      messageApi.success(
        checked
          ? "FAQ marked as featured."
          : "FAQ removed from featured."
      );

      dispatch(fetchFAQStats());
    } catch (error) {
      messageApi.error(
        typeof error === "string"
          ? error
          : "Failed to update featured status."
      );
    }
  };

  // =======================================================
  // TABLE COLUMNS
  // =======================================================

  const columns = [
    {
      title: "#",
      dataIndex: "display_order",
      key: "display_order",
      width: 70,
      sorter: (a, b) =>
        Number(a.display_order) -
        Number(b.display_order),
    },

    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      width: 320,

      render: (question) => (
        <Space align="start">
          <QuestionCircleOutlined />

          <Text strong>
            {question}
          </Text>
        </Space>
      ),
    },

    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 160,

      render: (category) => (
        <Tag color="blue">
          {category}
        </Tag>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,

      render: (_, record) => (
        <Space>
          <Switch
            size="small"
            checked={record.status === "Published"}
            loading={actionLoading}
            onChange={(checked) =>
              handleStatusChange(record, checked)
            }
          />

          <Badge
            status={
              record.status === "Published"
                ? "success"
                : "default"
            }
            text={record.status}
          />
        </Space>
      ),
    },

    {
      title: "Featured",
      dataIndex: "featured",
      key: "featured",
      width: 120,

      render: (_, record) => (
        <Tooltip
          title={
            record.featured
              ? "Remove featured"
              : "Mark as featured"
          }
        >
          <Button
            type="text"
            loading={actionLoading}
            icon={
              record.featured ? (
                <StarFilled />
              ) : (
                <StarOutlined />
              )
            }
            onClick={() =>
              handleFeaturedChange(
                record,
                !record.featured
              )
            }
          />
        </Tooltip>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      width: 160,

      render: (_, record) => (
        <Space>
          <Tooltip title="Preview">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() =>
                setPreviewFAQ(record)
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
            title="Delete FAQ"
            description="Are you sure you want to delete this FAQ?"
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
  ];

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <>
      {contextHolder}

      <div
        style={{
          padding: 24,
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

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
                marginBottom: 4,
              }}
            >
              FAQ Management
            </Title>

            <Text type="secondary">
              Manage frequently asked questions,
              categories, publishing status and
              featured FAQs.
            </Text>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add FAQ
          </Button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <Alert
            type="error"
            showIcon
            closable
            message={error}
            style={{
              marginBottom: 24,
            }}
          />
        )}

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
          <Col xs={24} sm={12} lg={6}>
            <Card loading={statsLoading}>
              <Statistic
                title="Total FAQs"
                value={stats.total_faqs}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card loading={statsLoading}>
              <Statistic
                title="Published"
                value={stats.published_faqs}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card loading={statsLoading}>
              <Statistic
                title="Drafts"
                value={stats.draft_faqs}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card loading={statsLoading}>
              <Statistic
                title="Featured"
                value={stats.featured_faqs}
              />
            </Card>
          </Col>
        </Row>

        {/* =================================================
            FILTERS
        ================================================= */}

        <Card
          style={{
            marginBottom: 24,
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Input
                allowClear
                size="large"
                placeholder="Search questions and answers..."
                value={searchText}
                onChange={(event) =>
                  setSearchText(
                    event.target.value
                  )
                }
              />
            </Col>

            <Col xs={24} md={8}>
              <Select
                size="large"
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
                  ...categories.map(
                    (category) => ({
                      label: category,
                      value: category,
                    })
                  ),
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* =================================================
            TABLE
        ================================================= */}

        <Card>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredFAQs}
            loading={loading}
            scroll={{
              x: 1000,
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) =>
                `Total ${total} FAQs`,
            }}
            locale={{
              emptyText:
                searchText ||
                categoryFilter !== "all"
                  ? "No FAQs match your filters."
                  : "No FAQs found.",
            }}
          />
        </Card>

        {/* =================================================
            CREATE / EDIT MODAL
        ================================================= */}

        <Modal
          title={
            editingFAQ
              ? "Edit FAQ"
              : "Create FAQ"
          }
          open={isModalOpen}
          onCancel={handleCancel}
          onOk={handleSubmit}
          okText={
            editingFAQ
              ? "Update FAQ"
              : "Create FAQ"
          }
          confirmLoading={actionLoading}
          width={700}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              label="Question"
              name="question"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter the question.",
                },
                {
                  max: 300,
                  message:
                    "Question cannot exceed 300 characters.",
                },
              ]}
            >
              <Input
                showCount
                maxLength={300}
                placeholder="Enter FAQ question"
              />
            </Form.Item>

            <Form.Item
              label="Answer"
              name="answer"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter the answer.",
                },
                {
                  max: 3000,
                  message:
                    "Answer cannot exceed 3000 characters.",
                },
              ]}
            >
              <TextArea
                showCount
                maxLength={3000}
                rows={7}
                placeholder="Enter FAQ answer"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
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
                    options={categories.map(
                      (category) => ({
                        label: category,
                        value: category,
                      })
                    )}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Status"
                  name="status"
                  rules={[
                    {
                      required: true,
                      message:
                        "Please select a status.",
                    },
                  ]}
                >
                  <Select
                    options={[
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
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Display Order"
                  name="display_order"
                  rules={[
                    {
                      required: true,
                      message:
                        "Please enter display order.",
                    },
                    {
                      type: "number",
                      min: 1,
                      message:
                        "Display order must be at least 1.",
                    },
                  ]}
                >
                  <Input
                    type="number"
                    min={1}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Featured"
                  name="featured"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* =================================================
            PREVIEW MODAL
        ================================================= */}

        <Modal
          title="FAQ Preview"
          open={Boolean(previewFAQ)}
          onCancel={() =>
            setPreviewFAQ(null)
          }
          footer={[
            <Button
              key="close"
              onClick={() =>
                setPreviewFAQ(null)
              }
            >
              Close
            </Button>,
          ]}
          width={700}
        >
          {previewFAQ && (
            <>
              <Space
                wrap
                style={{
                  marginBottom: 16,
                }}
              >
                <Tag color="blue">
                  {previewFAQ.category}
                </Tag>

                <Tag
                  color={
                    previewFAQ.status ===
                    "Published"
                      ? "green"
                      : "default"
                  }
                >
                  {previewFAQ.status}
                </Tag>

                {previewFAQ.featured && (
                  <Tag
                    icon={<StarFilled />}
                    color="gold"
                  >
                    Featured
                  </Tag>
                )}
              </Space>

              <Title level={4}>
                {previewFAQ.question}
              </Title>

              <Paragraph
                style={{
                  whiteSpace: "pre-wrap",
                }}
              >
                {previewFAQ.answer}
              </Paragraph>
            </>
          )}
        </Modal>
      </div>
    </>
  );
};

export default FAQManagement;