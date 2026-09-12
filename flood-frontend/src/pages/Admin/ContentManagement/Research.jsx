import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  Spin,
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

import { useDispatch, useSelector } from "react-redux";

import {
  fetchResearch,
  fetchResearchStats,
  addResearch,
  addResearchPdf,
  editResearch,
  removeResearch,
  changeResearchStatus,
  selectResearch,
  selectResearchStats,
  selectResearchLoading,
  selectResearchStatsLoading,
  selectResearchSubmitting,
  selectResearchPdfUploading,
  selectResearchDeleting,
} from "../../../store/slices/researchSlice";

const { Title, Text, Paragraph } =
  Typography;

const { TextArea } = Input;

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
    <Tag
      color={
        colors[category] || "default"
      }
    >
      {category}
    </Tag>
  );
};

/* =========================================================
   API IMAGE URL
========================================================= */

const getFileUrl = (fileUrl) => {
  if (!fileUrl) {
    return null;
  }

  if (
    fileUrl.startsWith("http://") ||
    fileUrl.startsWith("https://")
  ) {
    return fileUrl;
  }

  return fileUrl;
};

/* =========================================================
   COMPONENT
========================================================= */

const Research = () => {
  const dispatch = useDispatch();

  /* =======================================================
     REDUX STATE
  ======================================================= */

  const research = useSelector(
    selectResearch
  );

  const stats = useSelector(
    selectResearchStats
  );

  const loading = useSelector(
    selectResearchLoading
  );

  const statsLoading = useSelector(
    selectResearchStatsLoading
  );

  const submitting = useSelector(
    selectResearchSubmitting
  );

  const pdfUploading = useSelector(
    selectResearchPdfUploading
  );

  const deleting = useSelector(
    selectResearchDeleting
  );

  /* =======================================================
     LOCAL UI STATE
  ======================================================= */

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
     LOAD RESEARCH
  ======================================================= */

  useEffect(() => {
    dispatch(
      fetchResearch({
        search: searchText,
        status: statusFilter,
        category: categoryFilter,
      })
    );
  }, [
    dispatch,
    searchText,
    statusFilter,
    categoryFilter,
  ]);

  /* =======================================================
     LOAD STATS
  ======================================================= */

  useEffect(() => {
    dispatch(fetchResearchStats());
  }, [dispatch]);

  /* =======================================================
     LOCAL FILTER
     Keeps UI responsive even when API returns all data.
  ======================================================= */

  const filteredResearch = useMemo(() => {
    return research.filter((item) => {
      const search =
        searchText
          .toLowerCase()
          .trim();

      const title =
        item.title || "";

      const authors =
        item.authors || "";

      const category =
        item.category || "";

      const abstract =
        item.abstract || "";

      const matchesSearch =
        !search ||
        title
          .toLowerCase()
          .includes(search) ||
        authors
          .toLowerCase()
          .includes(search) ||
        category
          .toLowerCase()
          .includes(search) ||
        abstract
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
        values.image?.[0]
          ?.originFileObj || null;

      const pdfFile =
        values.pdf?.[0]
          ?.originFileObj || null;

      /* ================================================
         UPDATE
      ================================================ */

      if (editingResearch) {
        const result =
          await dispatch(
            editResearch({
              id: editingResearch.id,
              researchData: {
                title: values.title,
                authors: values.authors,
                category:
                  values.category,
                abstract:
                  values.abstract,
                publicationDate:
                  values.publicationDate,
                status: finalStatus,
                image: imageFile,
              },
            })
          ).unwrap();

        /* ----------------------------------------------
           Upload PDF separately
        ---------------------------------------------- */

        if (pdfFile) {
          await dispatch(
            addResearchPdf({
              researchId:
                editingResearch.id,
              pdfFile,
            })
          ).unwrap();
        }

        await dispatch(
          fetchResearchStats()
        );

        message.success(
          finalStatus === "Published"
            ? "Research published successfully."
            : "Research draft saved successfully."
        );

        closeModal();

        return;
      }

      /* ================================================
         CREATE
      ================================================ */

      const result =
        await dispatch(
          addResearch({
            title: values.title,
            authors: values.authors,
            category: values.category,
            abstract: values.abstract,
            publicationDate:
              values.publicationDate,
            status: finalStatus,
            image: imageFile,
          })
        ).unwrap();

      /* ----------------------------------------------
         Get newly-created research ID
      ---------------------------------------------- */

      const createdResearch =
        result?.data;

      const researchId =
        createdResearch?.id;

      /* ----------------------------------------------
         Upload PDF separately
      ---------------------------------------------- */

      if (pdfFile && researchId) {
        await dispatch(
          addResearchPdf({
            researchId,
            pdfFile,
          })
        ).unwrap();
      }

      await dispatch(
        fetchResearchStats()
      );

      message.success(
        finalStatus === "Published"
          ? "Research published successfully."
          : "Research draft saved successfully."
      );

      closeModal();
    } catch (error) {
      if (
        error?.errorFields
      ) {
        return;
      }

      message.error(
        typeof error === "string"
          ? error
          : "Unable to save research."
      );
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (id) => {
    try {
      await dispatch(
        removeResearch(id)
      ).unwrap();

      await dispatch(
        fetchResearchStats()
      );

      message.success(
        "Research deleted successfully."
      );
    } catch (error) {
      message.error(
        typeof error === "string"
          ? error
          : "Failed to delete research."
      );
    }
  };

  /* =======================================================
     PUBLISH / DRAFT
  ======================================================= */

  const toggleStatus = async (
    record
  ) => {
    try {
      await dispatch(
        changeResearchStatus(
          record.id
        )
      ).unwrap();

      await dispatch(
        fetchResearchStats()
      );

      message.success(
        record.status ===
          "Published"
          ? "Research moved to draft."
          : "Research published successfully."
      );
    } catch (error) {
      message.error(
        typeof error === "string"
          ? error
          : "Failed to change research status."
      );
    }
  };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const imageUploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept:
      "image/jpeg,image/png,image/webp,image/gif",
    listType: "picture-card",
  };

  /* =======================================================
     PDF UPLOAD
  ======================================================= */

  const pdfUploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept:
      ".pdf,application/pdf",
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = () => {
    dispatch(
      fetchResearch({
        search: searchText,
        status: statusFilter,
        category: categoryFilter,
      })
    );

    dispatch(
      fetchResearchStats()
    );
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
              loading={
                submitting
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
                loading={
                  deleting
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
                  {statsLoading ? (
                    <Spin size="small" />
                  ) : (
                    stats.total
                  )}
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
                  {statsLoading ? (
                    <Spin size="small" />
                  ) : (
                    stats.published
                  )}
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
                  {statsLoading ? (
                    <Spin size="small" />
                  ) : (
                    stats.drafts
                  )}
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
                  {statsLoading ? (
                    <Spin size="small" />
                  ) : (
                    stats.ai
                  )}
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
              value={
                categoryFilter
              }
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
                  label:
                    "Hydrology",
                  value:
                    "Hydrology",
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
              value={
                statusFilter
              }
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
            <Space>
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

              <Button
                onClick={
                  handleRefresh
                }
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>

        {/* TABLE */}

        <Table
          rowKey="id"
          columns={columns}
          dataSource={
            filteredResearch
          }
          loading={loading}
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

          {/* TITLE */}

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

          {/* AUTHORS */}

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

          {/* CATEGORY */}

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

          {/* ABSTRACT */}

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

          {/* IMAGE */}

          <Form.Item
            label="Research Image"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={(
              event
            ) =>
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
            Recommended: JPG, JPEG, PNG or
            WebP. Maximum 5 MB.
          </Text>

          {/* PDF */}

          <Form.Item
            label="Research PDF"
            name="pdf"
            valuePropName="fileList"
            getValueFromEvent={(
              event
            ) =>
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
            Maximum 20 MB.
          </Text>

          {/* DATE */}

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

          {/* STATUS */}

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

          {/* ACTIONS */}

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
              onClick={
                closeModal
              }
              disabled={
                submitting ||
                pdfUploading
              }
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
              loading={
                submitting ||
                pdfUploading
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
              loading={
                submitting ||
                pdfUploading
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

            {previewResearch.image_url && (
              <div
                style={{
                  marginBottom: 24,
                  textAlign: "center",
                }}
              >
                <img
                  src={getFileUrl(
                    previewResearch.image_url
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

            {previewResearch.pdf_url && (
              <Button
                type="primary"
                icon={
                  <FilePdfOutlined />
                }
                href={getFileUrl(
                  previewResearch.pdf_url
                )}
                target="_blank"
                rel="noopener noreferrer"
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