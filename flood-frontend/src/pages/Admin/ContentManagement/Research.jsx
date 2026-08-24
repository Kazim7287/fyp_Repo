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
  Upload,
  Tooltip,
  Divider,
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
  UploadOutlined,
  FilePdfOutlined,
  PictureOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/* =========================================================
   SAMPLE RESEARCH DATA
========================================================= */

const initialResearch = [
  {
    id: 1,

    title:
      "IoT and AI-Based Flood Early Warning System",

    authors:
      "FloodGuard Research Team",

    category: "AI",

    abstract:
      "Research on integrating IoT sensor networks, environmental data, machine learning, and time-series forecasting for flood early warning.",

    publicationDate:
      "2026-08-18",

    status: "Published",

    image: null,

    pdf: null,
  },

  {
    id: 2,

    title:
      "Real-Time IoT Sensor Network for Flood Monitoring",

    authors:
      "FloodGuard IoT Research Team",

    category: "IoT",

    abstract:
      "A study on real-time environmental monitoring using distributed IoT sensor nodes for water-level, rainfall, temperature, humidity, soil-moisture, and flow-rate measurements.",

    publicationDate:
      "2026-08-14",

    status: "Published",

    image: null,

    pdf: null,
  },

  {
    id: 3,

    title:
      "GIS-Based Flood Hazard Mapping",

    authors:
      "FloodGuard GIS Research Team",

    category: "GIS",

    abstract:
      "GIS-based spatial analysis for identifying flood-prone regions using elevation, land cover, drainage, rainfall, and hydrological datasets.",

    publicationDate:
      "2026-08-10",

    status: "Published",

    image: null,

    pdf: null,
  },

  {
    id: 4,

    title:
      "Hydrological Modeling for River Flood Forecasting",

    authors:
      "FloodGuard Hydrology Team",

    category: "Hydrology",

    abstract:
      "Research focused on hydrological parameters, river water-level dynamics, rainfall-runoff relationships, and short-term flood forecasting.",

    publicationDate:
      "2026-08-05",

    status: "Draft",

    image: null,

    pdf: null,
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
   CATEGORY TAG
========================================================= */

const getCategoryTag = (category) => {
  const colors = {
    AI: "purple",
    IoT: "blue",
    GIS: "green",
    Hydrology: "cyan",
  };

  return (
    <Tag color={colors[category] || "default"}>
      {category}
    </Tag>
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const Research = () => {
  const [research, setResearch] =
    useState(initialResearch);

  const [searchText, setSearchText] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [previewOpen, setPreviewOpen] =
    useState(false);

  const [editingResearch, setEditingResearch] =
    useState(null);

  const [previewResearch, setPreviewResearch] =
    useState(null);

  const [form] = Form.useForm();

  /* =======================================================
     FILTER DATA
  ======================================================= */

  const filteredResearch = useMemo(() => {
    return research.filter((item) => {
      const search =
        searchText.toLowerCase().trim();

      const matchesSearch =
        item.title
          .toLowerCase()
          .includes(search) ||
        item.authors
          .toLowerCase()
          .includes(search) ||
        item.category
          .toLowerCase()
          .includes(search) ||
        item.abstract
          .toLowerCase()
          .includes(search);

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
    research,
    searchText,
    statusFilter,
    categoryFilter,
  ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalResearch =
    research.length;

  const publishedResearch =
    research.filter(
      (item) =>
        item.status === "Published"
    ).length;

  const draftResearch =
    research.filter(
      (item) =>
        item.status === "Draft"
    ).length;

  const aiResearch =
    research.filter(
      (item) =>
        item.category === "AI"
    ).length;

  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreate = () => {
    setEditingResearch(null);

    form.resetFields();

    form.setFieldsValue({
      status: "Draft",
      image: [],
      pdf: [],
    });

    setModalOpen(true);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (record) => {
    setEditingResearch(record);

    form.setFieldsValue({
      title: record.title,
      authors: record.authors,
      category: record.category,
      abstract: record.abstract,
      publicationDate:
        record.publicationDate,
      status: record.status,

      image: [],
      pdf: [],
    });

    setModalOpen(true);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setModalOpen(false);

    form.resetFields();

    setEditingResearch(null);
  };

  /* =======================================================
     SAVE / PUBLISH
  ======================================================= */

  const handleSave = async (
    forcedStatus = null
  ) => {
    try {
      const values =
        await form.validateFields();

      const finalStatus =
        forcedStatus || values.status;

      const imageFile =
        values.image?.[0]?.originFileObj ||
        null;

      const pdfFile =
        values.pdf?.[0]?.originFileObj ||
        null;

      /* =========================================
         UPDATE
      ========================================= */

      if (editingResearch) {
        setResearch((previous) =>
          previous.map((item) =>
            item.id === editingResearch.id
              ? {
                  ...item,

                  title:
                    values.title,

                  authors:
                    values.authors,

                  category:
                    values.category,

                  abstract:
                    values.abstract,

                  publicationDate:
                    values.publicationDate,

                  status:
                    finalStatus,

                  image:
                    imageFile ||
                    item.image,

                  pdf:
                    pdfFile ||
                    item.pdf,
                }
              : item
          )
        );

        message.success(
          finalStatus === "Published"
            ? "Research published successfully."
            : "Research draft saved successfully."
        );
      }

      /* =========================================
         CREATE
      ========================================= */

      else {
        const newResearch = {
          id: Date.now(),

          title:
            values.title,

          authors:
            values.authors,

          category:
            values.category,

          abstract:
            values.abstract,

          publicationDate:
            values.publicationDate ||
            new Date()
              .toISOString()
              .split("T")[0],

          status:
            finalStatus,

          image:
            imageFile,

          pdf:
            pdfFile,
        };

        setResearch((previous) => [
          newResearch,
          ...previous,
        ]);

        message.success(
          finalStatus === "Published"
            ? "Research published successfully."
            : "Research draft saved successfully."
        );
      }

      closeModal();
    } catch (error) {
      // Ant Design validation handles errors.
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = (id) => {
    setResearch((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    message.success(
      "Research deleted successfully."
    );
  };

  /* =======================================================
     PUBLISH / DRAFT
  ======================================================= */

  const toggleStatus = (record) => {
    const newStatus =
      record.status === "Published"
        ? "Draft"
        : "Published";

    setResearch((previous) =>
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
        ? "Research published successfully."
        : "Research moved to draft."
    );
  };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const imageUploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: "image/*",
    listType: "picture-card",
  };

  /* =======================================================
     PDF UPLOAD
  ======================================================= */

  const pdfUploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: ".pdf,application/pdf",
  };

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = [
    {
      title: "Research Title",
      key: "title",
      width: 380,

      render: (_, record) => (
        <Space
          align="start"
          size={12}
        >
          <FileTextOutlined
            style={{
              fontSize: 22,
              marginTop: 3,
            }}
          />

          <div>
            <Text strong>
              {record.title}
            </Text>

            <br />

            <Text
              type="secondary"
              style={{
                fontSize: 12,
              }}
            >
              {record.authors}
            </Text>
          </div>
        </Space>
      ),
    },

    {
      title: "Category",
      dataIndex: "category",
      key: "category",

      render: (category) =>
        getCategoryTag(category),
    },

    {
      title: "Publication Date",
      dataIndex:
        "publicationDate",
      key: "publicationDate",
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",

      render: (status) =>
        getStatusTag(status),
    },

    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 190,

      render: (_, record) => (
        <Space>
          {/* PREVIEW */}

          <Tooltip title="Preview">
            <Button
              type="text"
              icon={
                <EyeOutlined />
              }
              onClick={() => {
                setPreviewResearch(
                  record
                );

                setPreviewOpen(true);
              }}
            />
          </Tooltip>

          {/* EDIT */}

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

          {/* PUBLISH / DRAFT */}

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
                  <SendOutlined />
                )
              }
              onClick={() =>
                toggleStatus(record)
              }
            />
          </Tooltip>

          {/* DELETE */}

          <Popconfirm
            title="Delete research?"
            description="This action cannot be undone."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{
              danger: true,
            }}
            icon={
              <ExclamationCircleOutlined />
            }
            onConfirm={() =>
              handleDelete(
                record.id
              )
            }
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
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
              margin: 0,
            }}
          >
            Research Management
          </Title>

          <Text type="secondary">
            Create, manage, publish, and
            organize research publications.
          </Text>
        </div>

        <Button
          type="primary"
          size="large"
          icon={
            <PlusOutlined />
          }
          onClick={handleCreate}
        >
          Create Research
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
            <Space>
              <FileTextOutlined
                style={{
                  fontSize: 24,
                }}
              />

              <div>
                <Text type="secondary">
                  Total Research
                </Text>

                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                  }}
                >
                  {totalResearch}
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Space>
              <CheckCircleOutlined
                style={{
                  fontSize: 24,
                }}
              />

              <div>
                <Text type="secondary">
                  Published
                </Text>

                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                  }}
                >
                  {publishedResearch}
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Space>
              <ClockCircleOutlined
                style={{
                  fontSize: 24,
                }}
              />

              <div>
                <Text type="secondary">
                  Drafts
                </Text>

                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                  }}
                >
                  {draftResearch}
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col
          xs={24}
          sm={12}
          lg={6}
        >
          <Card>
            <Space>
              <FilePdfOutlined
                style={{
                  fontSize: 24,
                }}
              />

              <div>
                <Text type="secondary">
                  AI Research
                </Text>

                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                  }}
                >
                  {aiResearch}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* =================================================
          RESEARCH TABLE
      ================================================= */}

      <Card
        title={
          <Space>
            <FileTextOutlined />

            <span>
              Research Publications
            </span>
          </Space>
        }
      >

        {/* SEARCH / FILTER */}

        <Row
          gutter={[12, 12]}
          style={{
            marginBottom: 20,
          }}
        >
          <Col
            xs={24}
            md={12}
            lg={14}
          >
            <Input
              size="large"
              allowClear
              prefix={
                <SearchOutlined />
              }
              placeholder="Search research by title, author, category..."
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
            md={6}
            lg={5}
          >
            <Select
              size="large"
              style={{
                width: "100%",
              }}
              value={categoryFilter}
              onChange={
                setCategoryFilter
              }
              options={[
                {
                  label:
                    "All Categories",
                  value: "all",
                },
                {
                  label: "AI",
                  value: "AI",
                },
                {
                  label: "IoT",
                  value: "IoT",
                },
                {
                  label: "GIS",
                  value: "GIS",
                },
                {
                  label: "Hydrology",
                  value: "Hydrology",
                },
              ]}
            />
          </Col>

          <Col
            xs={24}
            sm={12}
            md={6}
            lg={5}
          >
            <Select
              size="large"
              style={{
                width: "100%",
              }}
              value={statusFilter}
              onChange={
                setStatusFilter
              }
              options={[
                {
                  label:
                    "All Status",
                  value: "all",
                },
                {
                  label:
                    "Published",
                  value:
                    "Published",
                },
                {
                  label: "Draft",
                  value: "Draft",
                },
              ]}
            />
          </Col>

          <Col xs={24}>
            <Button
              icon={
                <ReloadOutlined />
              }
              onClick={() => {
                setSearchText("");
                setStatusFilter(
                  "all"
                );
                setCategoryFilter(
                  "all"
                );
              }}
            >
              Reset Filters
            </Button>
          </Col>
        </Row>

        {/* TABLE */}

        <Table
          rowKey="id"
          columns={columns}
          dataSource={
            filteredResearch
          }
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showTotal: (total) =>
              `Total ${total} research items`,
          }}
          scroll={{
            x: 950,
          }}
        />
      </Card>

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      <Modal
        title={
          editingResearch
            ? "Edit Research"
            : "Create Research"
        }
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={800}
        destroyOnHidden
      >

        <Form
          form={form}
          layout="vertical"
        >

          {/* ============================================
              RESEARCH TITLE
          ============================================ */}

          <Form.Item
            label="Research Title"
            name="title"
            rules={[
              {
                required: true,
                message:
                  "Please enter the research title.",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Enter research title"
              maxLength={250}
              showCount
            />
          </Form.Item>

          {/* ============================================
              AUTHORS
          ============================================ */}

          <Form.Item
            label="Authors"
            name="authors"
            rules={[
              {
                required: true,
                message:
                  "Please enter the authors.",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="e.g. Muhammad Kazim Ahmad, Sabahat Tufail..."
            />
          </Form.Item>

          {/* ============================================
              CATEGORY
          ============================================ */}

          <Form.Item
            label="Category"
            name="category"
            rules={[
              {
                required: true,
                message:
                  "Please select a research category.",
              },
            ]}
          >
            <Select
              size="large"
              placeholder="Select category"
              options={[
                {
                  label: "AI",
                  value: "AI",
                },
                {
                  label: "IoT",
                  value: "IoT",
                },
                {
                  label: "GIS",
                  value: "GIS",
                },
                {
                  label:
                    "Hydrology",
                  value:
                    "Hydrology",
                },
              ]}
            />
          </Form.Item>

          {/* ============================================
              ABSTRACT
          ============================================ */}

          <Form.Item
            label="Abstract"
            name="abstract"
            rules={[
              {
                required: true,
                message:
                  "Please enter the research abstract.",
              },
            ]}
          >
            <TextArea
              rows={7}
              placeholder="Enter research abstract..."
              maxLength={5000}
              showCount
            />
          </Form.Item>

          {/* ============================================
              RESEARCH IMAGE
          ============================================ */}

          <Form.Item
            label="Research Image"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={(event) =>
              event?.fileList
            }
          >
            <Upload
              {...imageUploadProps}
            >
              <div>
                <PictureOutlined
                  style={{
                    fontSize: 26,
                  }}
                />

                <div
                  style={{
                    marginTop: 8,
                  }}
                >
                  Upload Image
                </div>
              </div>
            </Upload>
          </Form.Item>

          <Text
            type="secondary"
            style={{
              display: "block",
              marginTop: -16,
              marginBottom: 20,
            }}
          >
            Recommended: JPG, JPEG, PNG or WebP.
          </Text>

          {/* ============================================
              RESEARCH PDF
          ============================================ */}

          <Form.Item
            label="Research PDF"
            name="pdf"
            valuePropName="fileList"
            getValueFromEvent={(event) =>
              event?.fileList
            }
          >
            <Upload
              {...pdfUploadProps}
            >
              <Button
                icon={
                  <UploadOutlined />
                }
              >
                Upload Research PDF
              </Button>
            </Upload>
          </Form.Item>

          <Text
            type="secondary"
            style={{
              display: "block",
              marginTop: -16,
              marginBottom: 20,
            }}
          >
            Only PDF documents are accepted.
          </Text>

          {/* ============================================
              PUBLICATION DATE
          ============================================ */}

          <Form.Item
            label="Publication Date"
            name="publicationDate"
            rules={[
              {
                required: true,
                message:
                  "Please select the publication date.",
              },
            ]}
          >
            <Input
              size="large"
              type="date"
            />
          </Form.Item>

          {/* ============================================
              STATUS
          ============================================ */}

          <Form.Item
            label="Publication Status"
            name="status"
            initialValue="Draft"
          >
            <Select
              size="large"
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

          <Divider />

          {/* ============================================
              ACTIONS
          ============================================ */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={closeModal}
            >
              Cancel
            </Button>

            <Button
              icon={
                <ClockCircleOutlined />
              }
              onClick={() =>
                handleSave("Draft")
              }
            >
              Save
            </Button>

            <Button
              type="primary"
              icon={
                <SendOutlined />
              }
              onClick={() =>
                handleSave(
                  "Published"
                )
              }
            >
              Publish
            </Button>
          </div>
        </Form>
      </Modal>

      {/* =================================================
          PREVIEW MODAL
      ================================================= */}

      <Modal
        title="Research Preview"
        open={previewOpen}
        onCancel={() => {
          setPreviewOpen(false);
          setPreviewResearch(null);
        }}
        footer={null}
        width={800}
      >
        {previewResearch && (
          <div>

            {/* CATEGORY + STATUS */}

            <Space
              wrap
              style={{
                marginBottom: 16,
              }}
            >
              {getCategoryTag(
                previewResearch.category
              )}

              {getStatusTag(
                previewResearch.status
              )}
            </Space>

            {/* TITLE */}

            <Title level={2}>
              {previewResearch.title}
            </Title>

            {/* AUTHORS */}

            <Text type="secondary">
              Authors:{" "}
              <strong>
                {
                  previewResearch.authors
                }
              </strong>
            </Text>

            <br />

            <Text type="secondary">
              Publication Date:{" "}
              <strong>
                {
                  previewResearch.publicationDate
                }
              </strong>
            </Text>

            <Divider />

            {/* IMAGE */}

            {previewResearch.image && (
              <div
                style={{
                  marginBottom: 24,
                  textAlign: "center",
                }}
              >
                <img
                  src={URL.createObjectURL(
                    previewResearch.image
                  )}
                  alt={
                    previewResearch.title
                  }
                  style={{
                    maxWidth: "100%",
                    maxHeight: 350,
                    objectFit:
                      "contain",
                    borderRadius: 8,
                  }}
                />
              </div>
            )}

            {/* ABSTRACT */}

            <Title level={4}>
              Abstract
            </Title>

            <Paragraph
              style={{
                lineHeight: 1.8,
              }}
            >
              {
                previewResearch.abstract
              }
            </Paragraph>

            <Divider />

            {/* PDF */}

            {previewResearch.pdf && (
              <Button
                type="primary"
                icon={
                  <FilePdfOutlined />
                }
                onClick={() => {
                  const url =
                    URL.createObjectURL(
                      previewResearch.pdf
                    );

                  window.open(
                    url,
                    "_blank"
                  );
                }}
              >
                Open Research PDF
              </Button>
            )}

          </div>
        )}
      </Modal>
    </div>
  );
};

export default Research;