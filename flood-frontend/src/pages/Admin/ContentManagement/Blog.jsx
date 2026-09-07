import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Card,
  Col,
  Row,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Input,
  Select,
  Modal,
  Form,
  Upload,
  Switch,
  Popconfirm,
  message,
  Statistic,
  Badge,
  Tooltip,
  Divider,
  Spin,
  Empty,
} from "antd";

import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SendOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
  PictureOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import ReactQuill from "react-quill-new";

import "react-quill-new/dist/quill.snow.css";

import { useDispatch, useSelector } from "react-redux";

import {
  
  createBlog,
  deleteBlog,
  fetchBlogStats,
  fetchBlogs,
  selectBlogCreating,
  selectBlogDeleting,
  selectBlogError,
  selectBlogLoading,
  selectBlogPagination,
  selectBlogStats,
  selectBlogToggling,
  selectBlogUpdating,
  toggleBlogPublish,
  selectBlogs,
  updateBlog,
} from "../../../store/slices/blogSlice"

const { Title, Text, Paragraph } =
  Typography;


// =========================================================
// CONSTANTS
// =========================================================

const BLOG_CATEGORIES = [
  "Flood Awareness",
  "Technology",
  "Research",
  "Safety",
];

const BLOG_STATUSES = [
  "Published",
  "Draft",
];


// =========================================================
// RICH TEXT EDITOR
// =========================================================

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],

    [
      "bold",
      "italic",
      "underline",
      "strike",
    ],

    [
      {
        list: "ordered",
      },
      {
        list: "bullet",
      },
    ],

    [
      {
        align: [],
      },
    ],

    [
      "blockquote",
      "code-block",
    ],

    [
      "link",
      "image",
    ],

    [
      "clean",
    ],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
];


// =========================================================
// IMAGE URL HELPER
// =========================================================

const getImageUrl = (imageUrl) => {

  if (!imageUrl) {
    return null;
  }

  // Already a complete URL
  if (
    imageUrl.startsWith(
      "http://"
    ) ||
    imageUrl.startsWith(
      "https://"
    )
  ) {
    return imageUrl;
  }

  const apiUrl =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

  const backendUrl =
    apiUrl.replace(
      /\/api\/?$/,
      ""
    );

  return `${backendUrl}${imageUrl}`;
};


// =========================================================
// COMPONENT
// =========================================================

const Blog = () => {

  const dispatch = useDispatch();

  // =======================================================
  // REDUX
  // =======================================================

  const blogs = useSelector(
    selectBlogs
  );

  const stats = useSelector(
    selectBlogStats
  );

  const pagination = useSelector(
    selectBlogPagination
  );

  const loading = useSelector(
    selectBlogLoading
  );

  const creating = useSelector(
    selectBlogCreating
  );

  const updating = useSelector(
    selectBlogUpdating
  );

  const deleting = useSelector(
    selectBlogDeleting
  );

  const toggling = useSelector(
    selectBlogToggling
  );

  const error = useSelector(
    selectBlogError
  );


  // =======================================================
  // LOCAL UI STATE
  // =======================================================

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(8);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [previewOpen, setPreviewOpen] =
    useState(false);

  const [editingPost, setEditingPost] =
    useState(null);

  const [previewPost, setPreviewPost] =
    useState(null);

  const [form] =
    Form.useForm();


  // =======================================================
  // LOAD BLOGS
  // =======================================================

  const loadBlogs =
    useCallback(() => {

      dispatch(
        fetchBlogs({
          search,
          status: statusFilter,
          category: categoryFilter,
          page: currentPage,
          limit: pageSize,
        })
      );

    }, [
      dispatch,
      search,
      statusFilter,
      categoryFilter,
      currentPage,
      pageSize,
    ]);


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {

    loadBlogs();

  }, [loadBlogs]);


  // =======================================================
  // LOAD STATISTICS
  // =======================================================

  useEffect(() => {

    dispatch(
      fetchBlogStats()
    );

  }, [dispatch]);


  // =======================================================
  // SHOW API ERROR
  // =======================================================

  useEffect(() => {

    if (error) {
      message.error(error);
    }

  }, [error]);


  // =======================================================
  // CREATE
  // =======================================================

  const handleCreate = () => {

    setEditingPost(null);

    form.resetFields();

    form.setFieldsValue({
      status: "Draft",
      featured: false,
      content: "",
      image: [],
    });

    setModalOpen(true);
  };


  // =======================================================
  // EDIT
  // =======================================================

  const handleEdit = (post) => {

    setEditingPost(post);

    form.setFieldsValue({
      title:
        post.title,

      category:
        post.category,

      status:
        post.status,

      featured:
        Boolean(post.featured),

      excerpt:
        post.excerpt,

      content:
        post.content,

      image: [],
    });

    setModalOpen(true);
  };


  // =======================================================
  // CLOSE MODAL
  // =======================================================

  const closeModal = () => {

    setModalOpen(false);

    form.resetFields();

    setEditingPost(null);
  };


  // =======================================================
  // SAVE BLOG
  // =======================================================

  const handleSave =
    async (
      forcedStatus = null
    ) => {

      try {

        const values =
          await form.validateFields();

        const finalStatus =
          forcedStatus ||
          values.status ||
          "Draft";

        const imageFile =
          values.image?.[0]
            ?.originFileObj ||
          null;


        const blogData = {

          title:
            values.title,

          category:
            values.category,

          status:
            finalStatus,

          featured:
            Boolean(
              values.featured
            ),

          excerpt:
            values.excerpt,

          content:
            values.content,

          image:
            imageFile,
        };


        // =================================================
        // UPDATE
        // =================================================

        if (editingPost) {

          const result =
            await dispatch(
              updateBlog({
                id:
                  editingPost.id,

                data:
                  blogData,
              })
            ).unwrap();

          message.success(
            finalStatus ===
              "Published"
              ? "Blog published successfully."
              : "Draft saved successfully."
          );

        }


        // =================================================
        // CREATE
        // =================================================

        else {

          await dispatch(
            createBlog(
              blogData
            )
          ).unwrap();

          message.success(
            finalStatus ===
              "Published"
              ? "Blog published successfully."
              : "Draft saved successfully."
          );
        }


        closeModal();

        // Refresh table
        loadBlogs();

        // Refresh statistics
        dispatch(
          fetchBlogStats()
        );

      } catch (error) {

        // Ant Design validation errors
        // are already displayed automatically.

        if (
          typeof error ===
          "string"
        ) {
          message.error(error);
        }
      }
    };


  // =======================================================
  // DELETE
  // =======================================================

  const handleDelete =
    async (id) => {

      try {

        await dispatch(
          deleteBlog(id)
        ).unwrap();

        message.success(
          "Blog deleted successfully."
        );

        loadBlogs();

        dispatch(
          fetchBlogStats()
        );

      } catch (error) {

        message.error(
          typeof error ===
            "string"
            ? error
            : "Failed to delete blog."
        );
      }
    };


  // =======================================================
  // TOGGLE PUBLISH
  // =======================================================

  const handleTogglePublish =
    async (post) => {

      try {

        await dispatch(
          toggleBlogPublish(
            post.id
          )
        ).unwrap();

        const newStatus =
          post.status ===
          "Published"
            ? "Draft"
            : "Published";

        message.success(
          newStatus ===
            "Published"
            ? "Blog published successfully."
            : "Blog moved to draft."
        );

        loadBlogs();

        dispatch(
          fetchBlogStats()
        );

      } catch (error) {

        message.error(
          typeof error ===
            "string"
            ? error
            : "Failed to update blog status."
        );
      }
    };


  // =======================================================
  // PREVIEW
  // =======================================================

  const handlePreview =
    (post) => {

      setPreviewPost(post);

      setPreviewOpen(true);
    };


  // =======================================================
  // SEARCH
  // =======================================================

  const handleSearch =
    (event) => {

      setSearch(
        event.target.value
      );

      setCurrentPage(1);
    };


  // =======================================================
  // STATUS FILTER
  // =======================================================

  const handleStatusChange =
    (value) => {

      setStatusFilter(value);

      setCurrentPage(1);
    };


  // =======================================================
  // CATEGORY FILTER
  // =======================================================

  const handleCategoryChange =
    (value) => {

      setCategoryFilter(value);

      setCurrentPage(1);
    };


  // =======================================================
  // TABLE DATA
  // =======================================================

  const tableData =
    useMemo(() => {

      return blogs.map(
        (post) => ({
          ...post,

          key:
            post.id,
        })
      );

    }, [blogs]);


  // =======================================================
  // UPLOAD CONFIGURATION
  // =======================================================

  const uploadProps = {

    beforeUpload: () => false,

    maxCount: 1,

    accept: "image/jpeg,image/png,image/webp,image/gif",

    listType: "picture-card",

  };


  // =======================================================
  // TABLE COLUMNS
  // =======================================================

  const columns = [

    // -----------------------------------------------------
    // TITLE
    // -----------------------------------------------------

    {
      title: "Title",

      dataIndex: "title",

      key: "title",

      render: (
        title,
        record
      ) => (

        <Space>

          {record.featured && (
            <Tooltip title="Featured Blog">

              <StarOutlined />

            </Tooltip>
          )}

          <Text strong>
            {title}
          </Text>

        </Space>
      ),
    },


    // -----------------------------------------------------
    // CATEGORY
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // STATUS
    // -----------------------------------------------------

    {
      title: "Status",

      dataIndex: "status",

      key: "status",

      render: (status) => (

        <Tag
          icon={
            status ===
            "Published" ? (
              <CheckCircleOutlined />
            ) : (
              <ClockCircleOutlined />
            )
          }

          color={
            status ===
            "Published"
              ? "success"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },


    // -----------------------------------------------------
    // VIEWS
    // -----------------------------------------------------

    {
      title: "Views",

      dataIndex: "views",

      key: "views",

      render: (views) =>
        Number(views || 0).toLocaleString(),
    },


    // -----------------------------------------------------
    // DATE
    // -----------------------------------------------------

    {
      title: "Date",

      dataIndex: "created_at",

      key: "created_at",

      render: (
        date,
        record
      ) => {

        const blogDate =
          date ||
          record.date;

        if (!blogDate) {
          return "-";
        }

        return new Date(
          blogDate
        ).toLocaleDateString();
      },
    },


    // -----------------------------------------------------
    // ACTIONS
    // -----------------------------------------------------

    {
      title: "Action",

      key: "action",

      fixed: "right",

      render: (
        _,
        record
      ) => (

        <Space>

          {/* VIEW */}

          <Tooltip title="View">

            <Button
              type="text"
              icon={
                <EyeOutlined />
              }
              onClick={() =>
                handlePreview(
                  record
                )
              }
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
                handleEdit(
                  record
                )
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

              loading={
                toggling
              }

              icon={
                record.status ===
                "Published" ? (
                  <ClockCircleOutlined />
                ) : (
                  <SendOutlined />
                )
              }

              onClick={() =>
                handleTogglePublish(
                  record
                )
              }
            />

          </Tooltip>


          {/* DELETE */}

          <Popconfirm
            title="Delete this blog?"

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


  // =======================================================
  // RENDER
  // =======================================================

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
          alignItems:
            "center",
          gap: 16,
          flexWrap:
            "wrap",
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
            Blog Management
          </Title>

          <Text type="secondary">
            Create, edit, publish, and manage
            public FloodGuard blog articles.
          </Text>

        </div>


        <Button
          type="primary"
          size="large"
          icon={
            <PlusOutlined />
          }
          onClick={
            handleCreate
          }
        >
          Create New Blog
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
              title="Total Blogs"
              value={
                stats.total
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
                stats.published
              }
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
              value={
                stats.drafts
              }
              prefix={
                <ClockCircleOutlined />
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
              value={
                stats.featured
              }
              prefix={
                <StarOutlined />
              }
            />

          </Card>

        </Col>

      </Row>


      {/* ===================================================
          BLOG LIST
      =================================================== */}

      <Card
        title={
          <Space>

            <Badge
              status="processing"
            />

            <span>
              Blog Articles
            </span>

          </Space>
        }

        extra={

          <Button
            icon={
              <ReloadOutlined />
            }
            onClick={() => {
              loadBlogs();

              dispatch(
                fetchBlogStats()
              );
            }}
          >
            Refresh
          </Button>
        }
      >

        {/* =================================================
            FILTERS
        ================================================= */}

        <Row
          gutter={[
            12,
            12,
          ]}
          style={{
            marginBottom: 20,
          }}
        >

          <Col
            xs={24}
            md={12}
          >

            <Input
              size="large"
              allowClear

              prefix={
                <SearchOutlined />
              }

              placeholder="Search blogs..."

              value={
                search
              }

              onChange={
                handleSearch
              }
            />

          </Col>


          <Col
            xs={24}
            sm={12}
            md={6}
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
                handleStatusChange
              }

              options={[
                {
                  value:
                    "all",

                  label:
                    "All Statuses",
                },

                ...BLOG_STATUSES.map(
                  (status) => ({
                    value:
                      status,

                    label:
                      status,
                  })
                ),
              ]}
            />

          </Col>


          <Col
            xs={24}
            sm={12}
            md={6}
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
                handleCategoryChange
              }

              options={[
                {
                  value:
                    "all",

                  label:
                    "All Categories",
                },

                ...BLOG_CATEGORIES.map(
                  (category) => ({
                    value:
                      category,

                    label:
                      category,
                  })
                ),
              ]}
            />

          </Col>

        </Row>


        {/* =================================================
            TABLE
        ================================================= */}

        <Table
          rowKey="id"

          columns={
            columns
          }

          dataSource={
            tableData
          }

          loading={
            loading
          }

          locale={{
            emptyText: (
              <Empty
                description="No blogs found"
              />
            ),
          }}

          pagination={{
            current:
              pagination.page ||
              currentPage,

            pageSize:
              pagination.limit ||
              pageSize,

            total:
              pagination.total ||
              0,

            showSizeChanger:
              true,

            pageSizeOptions: [
              8,
              16,
              24,
              50,
            ],

            showTotal:
              (total) =>
                `Total ${total} blogs`,

            onChange: (
              page,
              size
            ) => {

              setCurrentPage(
                page
              );

              if (
                size !==
                pageSize
              ) {

                setPageSize(
                  size
                );

                setCurrentPage(
                  1
                );
              }
            },
          }}

          scroll={{
            x: 1000,
          }}
        />

      </Card>


      {/* ===================================================
          CREATE / EDIT MODAL
      =================================================== */}

      <Modal

        title={
          editingPost
            ? "Edit Blog"
            : "Create New Blog"
        }

        open={
          modalOpen
        }

        onCancel={
          closeModal
        }

        footer={null}

        width={850}

        destroyOnHidden
      >

        <Form
          form={form}
          layout="vertical"
        >

          {/* =================================================
              TITLE
          ================================================= */}

          <Form.Item
            label="Title"
            name="title"

            rules={[
              {
                required:
                  true,

                message:
                  "Please enter the blog title.",
              },

              {
                max:
                  255,

                message:
                  "Title cannot exceed 255 characters.",
              },
            ]}
          >

            <Input
              size="large"
              placeholder="Enter blog title"
              showCount
              maxLength={255}
            />

          </Form.Item>


          {/* =================================================
              CATEGORY
          ================================================= */}

          <Form.Item
            label="Category"
            name="category"

            rules={[
              {
                required:
                  true,

                message:
                  "Please select a category.",
              },
            ]}
          >

            <Select
              size="large"
              placeholder="Select category"

              options={
                BLOG_CATEGORIES.map(
                  (category) => ({
                    value:
                      category,

                    label:
                      category,
                  })
                )
              }
            />

          </Form.Item>


          {/* =================================================
              IMAGE
          ================================================= */}

          <Form.Item
            label="Featured Image"

            name="image"

            valuePropName="fileList"

            getValueFromEvent={(
              event
            ) =>
              event?.fileList ||
              []
            }
          >

            <Upload
              {...uploadProps}
            >

              <div>

                <PictureOutlined
                  style={{
                    fontSize: 25,
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


          {/* =================================================
              EXCERPT
          ================================================= */}

          <Form.Item
            label="Short Description"
            name="excerpt"

            rules={[
              {
                required:
                  true,

                message:
                  "Please enter a short description.",
              },
            ]}
          >

            <Input.TextArea
              rows={4}
              showCount
              maxLength={300}
              placeholder="Enter a short description..."
            />

          </Form.Item>


          {/* =================================================
              CONTENT
          ================================================= */}

          <Form.Item
            label="Content"
            name="content"

            rules={[
              {
                required:
                  true,

                message:
                  "Please enter blog content.",
              },
            ]}
          >

            <ReactQuill
              theme="snow"

              modules={
                quillModules
              }

              formats={
                quillFormats
              }

              placeholder="Write your blog article here..."

              style={{
                minHeight: 280,
                marginBottom: 45,
              }}
            />

          </Form.Item>


          {/* =================================================
              STATUS
          ================================================= */}

          <Form.Item
            label="Publication Status"
            name="status"
          >

            <Select
              size="large"

              options={[
                {
                  value:
                    "Draft",

                  label:
                    "Draft",
                },

                {
                  value:
                    "Published",

                  label:
                    "Published",
                },
              ]}
            />

          </Form.Item>


          {/* =================================================
              FEATURED
          ================================================= */}

          <Form.Item
            label="Featured Blog"
            name="featured"

            valuePropName="checked"
          >

            <Switch
              checkedChildren="Yes"
              unCheckedChildren="No"
            />

          </Form.Item>


          <Divider />


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div
            style={{
              display:
                "flex",

              justifyContent:
                "flex-end",

              gap: 12,

              flexWrap:
                "wrap",
            }}
          >

            <Button
              onClick={
                closeModal
              }
            >
              Cancel
            </Button>


            <Button
              icon={
                <ClockCircleOutlined />
              }

              loading={
                creating ||
                updating
              }

              onClick={() =>
                handleSave(
                  "Draft"
                )
              }
            >
              Save Draft
            </Button>


            <Button
              type="primary"

              icon={
                <SendOutlined />
              }

              loading={
                creating ||
                updating
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


      {/* ===================================================
          PREVIEW MODAL
      =================================================== */}

      <Modal

        title="Blog Preview"

        open={
          previewOpen
        }

        onCancel={() =>
          setPreviewOpen(
            false
          )
        }

        footer={null}

        width={850}
      >

        {previewPost ? (

          <div>

            {/* IMAGE */}

            {previewPost.image_url && (

              <img
                src={
                  getImageUrl(
                    previewPost.image_url
                  )
                }

                alt={
                  previewPost.title
                }

                style={{
                  width:
                    "100%",

                  maxHeight:
                    400,

                  objectFit:
                    "cover",

                  borderRadius:
                    8,

                  marginBottom:
                    20,
                }}
              />

            )}


            {/* CATEGORY */}

            <Space
              style={{
                marginBottom:
                  12,
              }}
            >

              <Tag color="blue">
                {
                  previewPost.category
                }
              </Tag>

              <Tag
                color={
                  previewPost.status ===
                  "Published"
                    ? "success"
                    : "default"
                }
              >
                {
                  previewPost.status
                }
              </Tag>

            </Space>


            {/* TITLE */}

            <Title level={2}>
              {
                previewPost.title
              }
            </Title>


            {/* DATE / VIEWS */}

            <Space>

              <Text type="secondary">
                {previewPost.created_at
                  ? new Date(
                      previewPost.created_at
                    ).toLocaleDateString()
                  : "-"}
              </Text>

              <Text type="secondary">
                •
              </Text>

              <Text type="secondary">
                {Number(
                  previewPost.views ||
                  0
                ).toLocaleString()}{" "}
                views
              </Text>

            </Space>


            <Divider />


            {/* EXCERPT */}

            <Paragraph strong>
              {
                previewPost.excerpt
              }
            </Paragraph>


            <Divider />


            {/* CONTENT */}

            <div
              dangerouslySetInnerHTML={{
                __html:
                  previewPost.content ||
                  "",
              }}
            />

          </div>

        ) : (

          <Spin />

        )}

      </Modal>

    </div>
  );
};

export default Blog;