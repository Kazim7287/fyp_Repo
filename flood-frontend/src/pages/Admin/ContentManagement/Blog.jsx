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
  fetchBlogById,
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
  selectBlogs,
  toggleBlogPublish,
  updateBlog,
} from "../../../store/slices/blogSlice";

const { Title, Text, Paragraph } = Typography;

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| ReactQuill Configuration
|--------------------------------------------------------------------------
*/

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

    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  if (
    typeof imageUrl !== "string"
  ) {
    return null;
  }

  const trimmedUrl =
    imageUrl.trim();

  if (!trimmedUrl) {
    return null;
  }

  if (
    trimmedUrl.startsWith("http://") ||
    trimmedUrl.startsWith("https://") ||
    trimmedUrl.startsWith("data:")
  ) {
    return trimmedUrl;
  }

  return trimmedUrl.startsWith("/")
    ? trimmedUrl
    : `/${trimmedUrl}`;
};

const getErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    error?.error ||
    fallback
  );
};

const isInvalidEditorContent = (
  content
) => {
  if (
    !content ||
    typeof content !== "string"
  ) {
    return false;
  }

  const normalized =
    content
      .toLowerCase()
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .trim();

  const suspiciousPatterns = [
    "auth initialization failed",
    "axioserror",
    "request failed with status code 401",
    "(unauthorized)",
    "unauthorized",
    "failed to load resource",
    "at index-",
    "xhr @",
  ];

  return suspiciousPatterns.some(
    (pattern) =>
      normalized.includes(pattern)
  );
};

const hasEditorContent = (
  content
) => {
  if (
    !content ||
    typeof content !== "string"
  ) {
    return false;
  }

  const text =
    content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .trim();

  return text.length > 0;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

const Blog = () => {
  const dispatch = useDispatch();

  /*
  |--------------------------------------------------------------------------
  | Redux
  |--------------------------------------------------------------------------
  */

  const blogs =
    useSelector(selectBlogs);

  const stats =
    useSelector(selectBlogStats);

  const pagination =
    useSelector(
      selectBlogPagination
    );

  const loading =
    useSelector(
      selectBlogLoading
    );

  const creating =
    useSelector(
      selectBlogCreating
    );

  const updating =
    useSelector(
      selectBlogUpdating
    );

  const deleting =
    useSelector(
      selectBlogDeleting
    );

  const toggling =
    useSelector(
      selectBlogToggling
    );

  const error =
    useSelector(
      selectBlogError
    );

  /*
  |--------------------------------------------------------------------------
  | Local State
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    pageSize,
    setPageSize,
  ] = useState(8);

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    previewOpen,
    setPreviewOpen,
  ] = useState(false);

  const [
    previewLoading,
    setPreviewLoading,
  ] = useState(false);

  const [
    editingPost,
    setEditingPost,
  ] = useState(null);

  const [
    previewPost,
    setPreviewPost,
  ] = useState(null);

  const [form] =
    Form.useForm();

  /*
  |--------------------------------------------------------------------------
  | Load Blogs
  |--------------------------------------------------------------------------
  */

  const loadBlogs =
    useCallback(() => {
      dispatch(
        fetchBlogs({
          search: search.trim(),
          status: statusFilter,
          category:
            categoryFilter,
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

  /*
  |--------------------------------------------------------------------------
  | Initial / Filter Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(
      fetchBlogStats()
    );
  }, [dispatch]);

  /*
  |--------------------------------------------------------------------------
  | API Errors
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!error) {
      return;
    }

    message.error(
      getErrorMessage(
        error,
        "Failed to load blog data."
      )
    );
  }, [error]);

  /*
  |--------------------------------------------------------------------------
  | Create
  |--------------------------------------------------------------------------
  */

  const handleCreate = () => {
    setEditingPost(null);

    form.resetFields();

    form.setFieldsValue({
      title: "",
      category: undefined,
      status: "Draft",
      featured: false,
      excerpt: "",
      content: "",
      image: [],
    });

    setModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Edit
  |--------------------------------------------------------------------------
  */

  const handleEdit = async (
    post
  ) => {
    try {
      setEditingPost(post);

      form.setFieldsValue({
        title:
          post.title || "",
        category:
          post.category ||
          undefined,
        status:
          post.status ||
          "Draft",
        featured:
          Boolean(
            post.featured
          ),
        excerpt:
          post.excerpt || "",
        content:
          isInvalidEditorContent(
            post.content
          )
            ? ""
            : post.content || "",
        image: [],
      });

      setModalOpen(true);

      const result =
        await dispatch(
          fetchBlogById(
            post.id
          )
        ).unwrap();

      const fullBlog =
        result?.data ||
        result?.blog ||
        result;

      if (!fullBlog) {
        return;
      }

      const safeContent =
        isInvalidEditorContent(
          fullBlog.content
        )
          ? ""
          : fullBlog.content ||
            "";

      form.setFieldsValue({
        title:
          fullBlog.title || "",
        category:
          fullBlog.category ||
          undefined,
        status:
          fullBlog.status ||
          "Draft",
        featured:
          Boolean(
            fullBlog.featured
          ),
        excerpt:
          fullBlog.excerpt ||
          "",
        content:
          safeContent,
        image: [],
      });

      setEditingPost(
        fullBlog
      );
    } catch (error) {
      console.error(
        "Failed to load full blog:",
        error
      );

      /*
       * Do not prevent editing if the
       * single-blog request fails.
       */

      message.warning(
        "Could not load the latest blog content. The available blog data has been loaded."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Close Modal
  |--------------------------------------------------------------------------
  */

  const closeModal = () => {
    setModalOpen(false);

    form.resetFields();

    setEditingPost(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  const handleSave = async (
    forcedStatus = null
  ) => {
    try {
      const values =
        await form.validateFields();

      const finalStatus =
        forcedStatus ||
        values.status ||
        "Draft";

      const title =
        values.title?.trim() ||
        "";

      const category =
        values.category || "";

      const excerpt =
        values.excerpt?.trim() ||
        "";

      const content =
        values.content || "";

      /*
       * Never save accidental auth errors
       * inside the blog editor.
       */

      if (
        isInvalidEditorContent(
          content
        )
      ) {
        message.error(
          "The editor contains an authentication error instead of blog content. Please clear it and enter the article again."
        );

        return;
      }

      if (
        !hasEditorContent(
          content
        )
      ) {
        message.error(
          "Please enter blog content."
        );

        return;
      }

      const imageFile =
        values.image?.[0]
          ?.originFileObj ||
        null;

      const blogData = {
        title,
        category,
        status: finalStatus,
        featured:
          Boolean(
            values.featured
          ),
        excerpt,
        content,
        image: imageFile,
      };

      console.log(
        "BLOG DATA BEFORE SAVE:",
        blogData
      );

      if (editingPost) {
        await dispatch(
          updateBlog({
            id: editingPost.id,
            data: blogData,
          })
        ).unwrap();

        message.success(
          finalStatus ===
            "Published"
            ? "Blog published successfully."
            : "Draft saved successfully."
        );
      } else {
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

      loadBlogs();

      dispatch(
        fetchBlogStats()
      );
    } catch (error) {
      if (
        error?.errorFields
      ) {
        return;
      }

      console.error(
        "Save blog failed:",
        error
      );

      message.error(
        getErrorMessage(
          error,
          "Failed to save blog."
        )
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

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
        console.error(
          "Delete blog failed:",
          error
        );

        message.error(
          getErrorMessage(
            error,
            "Failed to delete blog."
          )
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Toggle Publish
  |--------------------------------------------------------------------------
  */

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
        console.error(
          "Toggle blog status failed:",
          error
        );

        message.error(
          getErrorMessage(
            error,
            "Failed to update blog status."
          )
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Preview
  |--------------------------------------------------------------------------
  */

  const handlePreview =
    async (post) => {
      setPreviewPost(post);

      setPreviewOpen(true);

      setPreviewLoading(true);

      try {
        const result =
          await dispatch(
            fetchBlogById(
              post.id
            )
          ).unwrap();

        const fullBlog =
          result?.data ||
          result?.blog ||
          result;

        if (fullBlog) {
          setPreviewPost(
            fullBlog
          );
        }
      } catch (error) {
        console.error(
          "Failed to load blog preview:",
          error
        );

        message.warning(
          "Could not load the latest blog content."
        );
      } finally {
        setPreviewLoading(
          false
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  const handleSearch =
    (event) => {
      setSearch(
        event.target.value
      );

      setCurrentPage(1);
    };

  const handleStatusChange =
    (value) => {
      setStatusFilter(value);

      setCurrentPage(1);
    };

  const handleCategoryChange =
    (value) => {
      setCategoryFilter(value);

      setCurrentPage(1);
    };

  /*
  |--------------------------------------------------------------------------
  | Table Data
  |--------------------------------------------------------------------------
  */

  const tableData =
    useMemo(() => {
      if (
        !Array.isArray(
          blogs
        )
      ) {
        console.error(
          "Redux blogs is not an array:",
          blogs
        );

        return [];
      }

      return blogs.map(
        (post) => ({
          ...post,
          key: post.id,
        })
      );
    }, [blogs]);

  /*
  |--------------------------------------------------------------------------
  | Upload
  |--------------------------------------------------------------------------
  */

  const uploadProps = {
    beforeUpload: () => false,

    maxCount: 1,

    accept:
      "image/jpeg,image/png,image/webp,image/gif",

    listType: "picture-card",
  };

  /*
  |--------------------------------------------------------------------------
  | Columns
  |--------------------------------------------------------------------------
  */

  const columns = [
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
            {title || "-"}
          </Text>
        </Space>
      ),
    },

    {
      title: "Category",
      dataIndex: "category",
      key: "category",

      render: (
        category
      ) => (
        <Tag color="blue">
          {category || "-"}
        </Tag>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",

      render: (
        status
      ) => (
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
          {status || "Draft"}
        </Tag>
      ),
    },

    {
      title: "Views",
      dataIndex: "views",
      key: "views",

      render: (views) =>
        Number(
          views || 0
        ).toLocaleString(),
    },

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

        const parsedDate =
          new Date(
            blogDate
          );

        if (
          Number.isNaN(
            parsedDate.getTime()
          )
        ) {
          return "-";
        }

        return parsedDate.toLocaleDateString();
      },
    },

    {
      title: "Action",
      key: "action",
      fixed: "right",

      render: (
        _,
        record
      ) => (
        <Space>
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
                loading={
                  deleting
                }
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

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div>
      {/* Header */}

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
            Blog Management
          </Title>

          <Text type="secondary">
            Create, edit, publish,
            and manage public
            FloodGuard blog
            articles.
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

      {/* Statistics */}

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
              title="Total Blogs"
              value={
                stats?.total ||
                0
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
                stats?.published ||
                0
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
                stats?.drafts ||
                0
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
                stats?.featured ||
                0
              }
              prefix={
                <StarOutlined />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Blog List */}

      <Card
        title={
          <Space>
            <Badge status="processing" />
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
        {/* Filters */}

        <Row
          gutter={[12, 12]}
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
              value={search}
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
                  value: "all",
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
                  value: "all",
                  label:
                    "All Categories",
                },

                ...BLOG_CATEGORIES.map(
                  (
                    category
                  ) => ({
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

        {/* Table */}

        <Table
          rowKey="id"
          columns={columns}
          dataSource={
            tableData
          }
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                description="No blogs found"
              />
            ),
          }}
          pagination={{
            current:
              pagination?.page ||
              currentPage,

            pageSize:
              pagination?.limit ||
              pageSize,

            total:
              pagination?.total ||
              0,

            showSizeChanger: true,

            pageSizeOptions: [
              8,
              16,
              24,
              50,
            ],

            showTotal: (
              total
            ) =>
              `Total ${total} blogs`,

            onChange: (
              page,
              size
            ) => {
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

                return;
              }

              setCurrentPage(
                page
              );
            },
          }}
          scroll={{
            x: 1000,
          }}
        />
      </Card>

      {/* Create / Edit Modal */}

      <Modal
        title={
          editingPost
            ? "Edit Blog"
            : "Create New Blog"
        }
        open={modalOpen}
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
          <Form.Item
            label="Title"
            name="title"
            rules={[
              {
                required: true,
                whitespace: true,
                message:
                  "Please enter the blog title.",
              },

              {
                max: 255,
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
              size="large"
              placeholder="Select category"
              options={BLOG_CATEGORIES.map(
                (
                  category
                ) => ({
                  value:
                    category,
                  label:
                    category,
                })
              )}
            />
          </Form.Item>

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

          <Form.Item
            label="Short Description"
            name="excerpt"
            rules={[
              {
                required: true,
                whitespace: true,
                message:
                  "Please enter a short description.",
              },

              {
                max: 300,
                message:
                  "Short description cannot exceed 300 characters.",
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

          <Form.Item
            label="Content"
            name="content"
            rules={[
              {
                validator:
                  async (
                    _,
                    value
                  ) => {
                    if (
                      isInvalidEditorContent(
                        value
                      )
                    ) {
                      throw new Error(
                        "The editor contains an authentication error. Please clear it and enter your blog content."
                      );
                    }

                    if (
                      !hasEditorContent(
                        value
                      )
                    ) {
                      throw new Error(
                        "Please enter blog content."
                      );
                    }
                  },
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

          <Form.Item
            label="Publication Status"
            name="status"
          >
            <Select
              size="large"
              options={[
                {
                  value: "Draft",
                  label: "Draft",
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

      {/* Preview */}

      <Modal
        title="Blog Preview"
        open={previewOpen}
        onCancel={() => {
          setPreviewOpen(
            false
          );

          setPreviewPost(
            null
          );
        }}
        footer={null}
        width={850}
      >
        {previewLoading ? (
          <div
            style={{
              minHeight: 300,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
            }}
          >
            <Spin size="large" />
          </div>
        ) : previewPost ? (
          <div>
            {previewPost.image_url && (
              <img
                src={getImageUrl(
                  previewPost.image_url
                )}
                alt={
                  previewPost.title ||
                  "Blog image"
                }
                onError={(
                  event
                ) => {
                  event.currentTarget.style.display =
                    "none";
                }}
                style={{
                  width: "100%",
                  maxHeight: 400,
                  objectFit:
                    "cover",
                  borderRadius: 8,
                  marginBottom: 20,
                }}
              />
            )}

            <Space
              style={{
                marginBottom: 12,
              }}
            >
              {previewPost.category && (
                <Tag color="blue">
                  {
                    previewPost.category
                  }
                </Tag>
              )}

              <Tag
                color={
                  previewPost.status ===
                  "Published"
                    ? "success"
                    : "default"
                }
              >
                {
                  previewPost.status ||
                  "Draft"
                }
              </Tag>

              {previewPost.featured && (
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

            <Title level={2}>
              {
                previewPost.title
              }
            </Title>

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

            {previewPost.excerpt && (
              <>
                <Paragraph strong>
                  {
                    previewPost.excerpt
                  }
                </Paragraph>

                <Divider />
              </>
            )}

            {isInvalidEditorContent(
              previewPost.content
            ) ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background:
                    "#fff2f0",
                  border:
                    "1px solid #ffccc7",
                }}
              >
                <Text type="danger">
                  This blog contains
                  invalid authentication
                  error text instead of
                  article content.
                </Text>
              </div>
            ) : (
              <div
                className="blog-preview-content"
                dangerouslySetInnerHTML={{
                  __html:
                    previewPost.content ||
                    "",
                }}
              />
            )}
          </div>
        ) : (
          <Empty description="No blog selected." />
        )}
      </Modal>
    </div>
  );
};

export default Blog;