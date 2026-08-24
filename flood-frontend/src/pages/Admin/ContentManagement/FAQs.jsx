import { useMemo, useState } from "react";

import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Empty,
  Collapse,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  StarOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const { TextArea } = Input;

const { Option } = Select;


/* =========================================================
   SAMPLE FAQ DATA
========================================================= */

const initialFAQs = [
  {
    id: 1,

    question:
      "What is the FloodGuard Early Warning System?",

    answer:
      "FloodGuard is an IoT and AI-based flood early-warning platform that collects real-time environmental data and provides flood-risk forecasts and alerts.",

    category: "General",

    status: "Published",

    featured: true,

    order: 1,
  },

  {
    id: 2,

    question:
      "How does the system monitor water levels?",

    answer:
      "Monitoring stations equipped with water-level sensors continuously collect measurements and transmit them to the central monitoring platform.",

    category: "Monitoring",

    status: "Published",

    featured: true,

    order: 2,
  },

  {
    id: 3,

    question:
      "How are flood predictions generated?",

    answer:
      "The system processes current sensor readings, historical observations, rainfall and environmental data through AI models such as LSTM, Random Forest and XGBoost.",

    category: "AI & Forecasting",

    status: "Published",

    featured: false,

    order: 3,
  },

  {
    id: 4,

    question:
      "What should I do when a critical flood alert is issued?",

    answer:
      "Follow official emergency instructions, move to a safe location if evacuation is advised, avoid flooded roads and remain updated through official communication channels.",

    category: "Emergency",

    status: "Draft",

    featured: false,

    order: 4,
  },
];


/* =========================================================
   COMPONENT
========================================================= */

const FAQs = () => {

  const [faqs, setFaqs] =
    useState(initialFAQs);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingFAQ, setEditingFAQ] =
    useState(null);

  const [viewFAQ, setViewFAQ] =
    useState(null);

  const [searchText, setSearchText] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [form] = Form.useForm();


  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalFAQs =
    faqs.length;

  const publishedFAQs =
    faqs.filter(
      (item) =>
        item.status === "Published"
    ).length;

  const draftFAQs =
    faqs.filter(
      (item) =>
        item.status === "Draft"
    ).length;

  const featuredFAQs =
    faqs.filter(
      (item) =>
        item.featured
    ).length;


  /* =======================================================
     FILTER DATA
  ======================================================= */

  const filteredFAQs = useMemo(() => {

    return faqs.filter((item) => {

      const matchesSearch =
        item.question
          .toLowerCase()
          .includes(
            searchText.toLowerCase()
          ) ||
        item.answer
          .toLowerCase()
          .includes(
            searchText.toLowerCase()
          );

      const matchesCategory =
        categoryFilter === "all" ||
        item.category === categoryFilter;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  }, [
    faqs,
    searchText,
    categoryFilter,
  ]);


  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreate = () => {

    setEditingFAQ(null);

    form.resetFields();

    form.setFieldsValue({
      status: "Draft",
      featured: false,
      order: faqs.length + 1,
    });

    setModalOpen(true);
  };


  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (record) => {

    setEditingFAQ(record);

    form.setFieldsValue({
      question: record.question,
      answer: record.answer,
      category: record.category,
      status: record.status,
      featured: record.featured,
      order: record.order,
    });

    setModalOpen(true);
  };


  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async () => {

    try {

      const values =
        await form.validateFields();


      const faqData = {

        question:
          values.question,

        answer:
          values.answer,

        category:
          values.category,

        status:
          values.status,

        featured:
          values.featured || false,

        order:
          values.order || 1,
      };


      /* =================================================
         UPDATE
      ================================================= */

      if (editingFAQ) {

        setFaqs((previous) =>
          previous.map((item) =>
            item.id ===
            editingFAQ.id
              ? {
                  ...item,
                  ...faqData,
                }
              : item
          )
        );

        message.success(
          "FAQ updated successfully."
        );

      }


      /* =================================================
         CREATE
      ================================================= */

      else {

        const newFAQ = {

          id: Date.now(),

          ...faqData,
        };

        setFaqs((previous) => [
          ...previous,
          newFAQ,
        ]);

        message.success(
          "FAQ created successfully."
        );
      }


      setModalOpen(false);

      form.resetFields();

    }

    catch (error) {

      // Ant Design handles validation errors.

    }
  };


  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = (id) => {

    setFaqs((previous) =>
      previous.filter(
        (item) =>
          item.id !== id
      )
    );

    message.success(
      "FAQ deleted successfully."
    );
  };


  /* =======================================================
     STATUS
  ======================================================= */

  const handleStatusChange = (
    record,
    checked
  ) => {

    const newStatus =
      checked
        ? "Published"
        : "Draft";


    setFaqs((previous) =>
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
      checked
        ? "FAQ published."
        : "FAQ moved to draft."
    );
  };


  /* =======================================================
     FEATURED
  ======================================================= */

  const handleFeaturedChange = (
    record,
    checked
  ) => {

    setFaqs((previous) =>
      previous.map((item) =>
        item.id === record.id
          ? {
              ...item,
              featured: checked,
            }
          : item
      )
    );
  };


  /* =======================================================
     STATUS TAG
  ======================================================= */

  const renderStatus = (status) => {

    if (status === "Published") {

      return (
        <Tag
          icon={
            <CheckCircleOutlined />
          }
          color="success"
        >
          Published
        </Tag>
      );
    }


    return (
      <Tag
        icon={
          <FileTextOutlined />
        }
      >
        Draft
      </Tag>
    );
  };


  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = [

    {
      title: "#",
      dataIndex: "order",
      key: "order",
      width: 70,

      sorter: (a, b) =>
        a.order - b.order,
    },


    {
      title: "Question",
      dataIndex: "question",
      key: "question",

      render: (question) => (

        <Space align="start">

          <QuestionCircleOutlined
            style={{
              marginTop: 4,
            }}
          />

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

      render: (status) =>
        renderStatus(status),
    },


    {
      title: "Featured",
      dataIndex: "featured",
      key: "featured",

      render: (featured, record) => (

        <Switch
          size="small"
          checked={featured}
          checkedChildren={
            <StarOutlined />
          }
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

      fixed: "right",

      render: (_, record) => (

        <Space>

          {/* VIEW */}

          <Button
            type="text"
            icon={
              <EyeOutlined />
            }
            onClick={() =>
              setViewFAQ(record)
            }
          />


          {/* EDIT */}

          <Button
            type="text"
            icon={
              <EditOutlined />
            }
            onClick={() =>
              handleEdit(record)
            }
          />


          {/* DELETE */}

          <Popconfirm
            title="Delete this FAQ?"
            description="This action cannot be undone."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{
              danger: true,
            }}
            onConfirm={() =>
              handleDelete(
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
  ];


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div>

      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >

        <div>

          <Title
            level={3}
            style={{
              marginBottom: 4,
            }}
          >
            FAQs Management
          </Title>

          <Text type="secondary">
            Create, edit, organize, and
            publish frequently asked questions.
          </Text>

        </div>


        <Button
          type="primary"
          icon={
            <PlusOutlined />
          }
          onClick={handleCreate}
        >
          Create FAQ
        </Button>

      </div>


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
              title="Total FAQs"
              value={totalFAQs}
              prefix={
                <QuestionCircleOutlined />
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
              value={publishedFAQs}
              prefix={
                <CheckCircleOutlined />
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
              title="Drafts"
              value={draftFAQs}
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
              title="Featured"
              value={featuredFAQs}
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
          marginBottom: 16,
        }}
      >

        <Row
          gutter={[
            16,
            16,
          ]}
        >

          <Col
            xs={24}
            md={16}
          >

            <Input
              allowClear
              prefix={
                <SearchOutlined />
              }
              placeholder="Search questions or answers..."
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
            md={8}
          >

            <Select
              style={{
                width: "100%",
              }}
              value={categoryFilter}
              onChange={
                setCategoryFilter
              }
            >

              <Option value="all">
                All Categories
              </Option>

              <Option value="General">
                General
              </Option>

              <Option value="Monitoring">
                Monitoring
              </Option>

              <Option value="AI & Forecasting">
                AI & Forecasting
              </Option>

              <Option value="Emergency">
                Emergency
              </Option>

            </Select>

          </Col>

        </Row>

      </Card>


      {/* ===================================================
          FAQ TABLE
      =================================================== */}

      <Card
        title="FAQ Management"
      >

        {filteredFAQs.length > 0 ? (

          <Table
            rowKey="id"
            columns={columns}
            dataSource={
              filteredFAQs
            }
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
            scroll={{
              x: 950,
            }}
          />

        ) : (

          <Empty
            description="No FAQs found"
          />

        )}

      </Card>


      {/* ===================================================
          CREATE / EDIT MODAL
      =================================================== */}

      <Modal
        title={
          editingFAQ
            ? "Edit FAQ"
            : "Create FAQ"
        }
        open={modalOpen}
        onCancel={() => {

          setModalOpen(false);

          form.resetFields();

        }}
        onOk={handleSave}
        okText={
          editingFAQ
            ? "Update"
            : "Create"
        }
        width={700}
        destroyOnHidden
      >

        <Form
          form={form}
          layout="vertical"
        >

          {/* QUESTION */}

          <Form.Item
            label="Question"
            name="question"
            rules={[
              {
                required: true,
                message:
                  "Please enter the question.",
              },
            ]}
          >

            <Input
              placeholder="Enter frequently asked question"
              maxLength={300}
              showCount
            />

          </Form.Item>


          {/* ANSWER */}

          <Form.Item
            label="Answer"
            name="answer"
            rules={[
              {
                required: true,
                message:
                  "Please enter the answer.",
              },
            ]}
          >

            <TextArea
              rows={7}
              placeholder="Enter the answer..."
              maxLength={3000}
              showCount
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
                  "Please select a category.",
              },
            ]}
          >

            <Select
              placeholder="Select category"
            >

              <Option value="General">
                General
              </Option>

              <Option value="Monitoring">
                Monitoring
              </Option>

              <Option value="AI & Forecasting">
                AI & Forecasting
              </Option>

              <Option value="Emergency">
                Emergency
              </Option>

              <Option value="Sensors">
                Sensors
              </Option>

              <Option value="Alerts">
                Alerts
              </Option>

            </Select>

          </Form.Item>


          {/* STATUS + ORDER */}

          <Row
            gutter={16}
          >

            <Col
              xs={24}
              sm={12}
            >

              <Form.Item
                label="Status"
                name="status"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >

                <Select>

                  <Option value="Draft">
                    Draft
                  </Option>

                  <Option value="Published">
                    Published
                  </Option>

                </Select>

              </Form.Item>

            </Col>


            <Col
              xs={24}
              sm={12}
            >

              <Form.Item
                label="Display Order"
                name="order"
              >

                <InputNumber
                  min={1}
                  style={{
                    width: "100%",
                  }}
                />

              </Form.Item>

            </Col>

          </Row>


          {/* FEATURED */}

          <Form.Item
            label="Featured FAQ"
            name="featured"
            valuePropName="checked"
          >

            <Switch />

          </Form.Item>

        </Form>

      </Modal>


      {/* ===================================================
          VIEW / PREVIEW MODAL
      =================================================== */}

      <Modal
        title="FAQ Preview"
        open={!!viewFAQ}
        footer={null}
        onCancel={() =>
          setViewFAQ(null)
        }
        width={750}
      >

        {viewFAQ && (

          <div>

            <Space
              wrap
              style={{
                marginBottom: 16,
              }}
            >

              <Tag color="blue">
                {viewFAQ.category}
              </Tag>

              {renderStatus(
                viewFAQ.status
              )}

              {viewFAQ.featured && (

                <Tag
                  icon={
                    <StarOutlined />
                  }
                  color="gold"
                >
                  Featured
                </Tag>

              )}

            </Space>


            <Collapse
              defaultActiveKey={[
                "1",
              ]}
              items={[
                {
                  key: "1",

                  label: (
                    <Text strong>
                      {viewFAQ.question}
                    </Text>
                  ),

                  children: (
                    <Text>
                      {viewFAQ.answer}
                    </Text>
                  ),
                },
              ]}
            />

          </div>

        )}

      </Modal>

    </div>
  );
};


export default FAQs;