import { useMemo, useState } from "react";

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
} from "@ant-design/icons";

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const { Title, Text, Paragraph } = Typography;


/* =========================================================
   PROTOTYPE BLOG DATA
========================================================= */

const initialPosts = [
  {
    id: 1,
    title: "Flood Safety",
    category: "Flood Awareness",
    status: "Published",
    featured: true,
    date: "2026-08-18",
    views: 1248,
    excerpt:
      "Important flood safety instructions and preparedness guidelines.",
    content:
      "<h2>Flood Safety</h2><p>Follow official warnings and move to safe areas when instructed.</p>",
    image: null,
  },

  {
    id: 2,
    title: "AI Forecasting",
    category: "Technology",
    status: "Draft",
    featured: false,
    date: "2026-08-15",
    views: 0,
    excerpt:
      "Understanding how AI models can support flood forecasting.",
    content:
      "<h2>AI Flood Forecasting</h2><p>Machine learning can support flood prediction using historical and environmental data.</p>",
    image: null,
  },

  {
    id: 3,
    title: "2010 Flood Study",
    category: "Research",
    status: "Published",
    featured: false,
    date: "2026-08-10",
    views: 2145,
    excerpt:
      "Research analysis of historical flood events and their impacts.",
    content:
      "<h2>2010 Flood Study</h2><p>This study examines historical flood patterns and their consequences.</p>",
    image: null,
  },
];


/* =========================================================
   RICH TEXT EDITOR
========================================================= */

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],

    ["bold", "italic", "underline", "strike"],

    [{ list: "ordered" }, { list: "bullet" }],

    [{ align: [] }],

    ["blockquote", "code-block"],

    ["link", "image"],

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
  "bullet",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
];


/* =========================================================
   COMPONENT
========================================================= */

const Blog = () => {
  const [posts, setPosts] = useState(initialPosts);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [previewOpen, setPreviewOpen] =
    useState(false);

  const [editingPost, setEditingPost] =
    useState(null);

  const [previewPost, setPreviewPost] =
    useState(null);

  const [form] = Form.useForm();


  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalPosts = posts.length;

  const publishedPosts = posts.filter(
    (post) => post.status === "Published"
  ).length;

  const draftPosts = posts.filter(
    (post) => post.status === "Draft"
  ).length;

  const featuredPosts = posts.filter(
    (post) => post.featured
  ).length;


  /* =========================================================
     FILTER POSTS
  ========================================================= */

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const query =
        search.toLowerCase().trim();

      const matchesSearch =
        post.title
          .toLowerCase()
          .includes(query) ||
        post.category
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        post.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        post.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    posts,
    search,
    statusFilter,
    categoryFilter,
  ]);


  /* =========================================================
     CREATE BLOG
  ========================================================= */

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


  /* =========================================================
     EDIT BLOG
  ========================================================= */

  const handleEdit = (post) => {
    setEditingPost(post);

    form.setFieldsValue({
      title: post.title,
      category: post.category,
      status: post.status,
      featured: post.featured,
      excerpt: post.excerpt,
      content: post.content,
      image: [],
    });

    setModalOpen(true);
  };


  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    setModalOpen(false);

    form.resetFields();

    setEditingPost(null);
  };


  /* =========================================================
     SAVE BLOG
  ========================================================= */

  const handleSave = async (forcedStatus = null) => {
    try {
      const values =
        await form.validateFields();

      const finalStatus =
        forcedStatus || values.status;

      const imageFile =
        values.image?.[0]?.originFileObj ||
        null;


      /* =====================================================
         UPDATE EXISTING BLOG
      ===================================================== */

      if (editingPost) {
        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === editingPost.id
              ? {
                  ...post,

                  title: values.title,

                  category:
                    values.category,

                  status: finalStatus,

                  featured:
                    values.featured || false,

                  excerpt:
                    values.excerpt,

                  content:
                    values.content,

                  image:
                    imageFile || post.image,
                }
              : post
          )
        );

        message.success(
          finalStatus === "Published"
            ? "Blog published successfully."
            : "Draft saved successfully."
        );
      }


      /* =====================================================
         CREATE NEW BLOG
      ===================================================== */

      else {
        const newPost = {
          id: Date.now(),

          title: values.title,

          category:
            values.category,

          status: finalStatus,

          featured:
            values.featured || false,

          date: new Date()
            .toISOString()
            .split("T")[0],

          views: 0,

          excerpt:
            values.excerpt,

          content:
            values.content,

          image: imageFile,
        };

        setPosts((currentPosts) => [
          newPost,
          ...currentPosts,
        ]);

        message.success(
          finalStatus === "Published"
            ? "Blog published successfully."
            : "Draft saved successfully."
        );
      }

      closeModal();

    } catch (error) {
      // Ant Design validation handles errors.
    }
  };


  /* =========================================================
     DELETE BLOG
  ========================================================= */

  const handleDelete = (id) => {
    setPosts((currentPosts) =>
      currentPosts.filter(
        (post) => post.id !== id
      )
    );

    message.success(
      "Blog deleted successfully."
    );
  };


  /* =========================================================
     PUBLISH / MOVE TO DRAFT
  ========================================================= */

  const handleTogglePublish = (post) => {
    const newStatus =
      post.status === "Published"
        ? "Draft"
        : "Published";

    setPosts((currentPosts) =>
      currentPosts.map((item) =>
        item.id === post.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    message.success(
      newStatus === "Published"
        ? "Blog published successfully."
        : "Blog moved to draft."
    );
  };


  /* =========================================================
     PREVIEW
  ========================================================= */

  const handlePreview = (post) => {
    setPreviewPost(post);

    setPreviewOpen(true);
  };


  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const uploadProps = {
    beforeUpload: () => false,

    maxCount: 1,

    accept: "image/*",

    listType: "picture-card",
  };


  /* =========================================================
     TABLE
  ========================================================= */

  const columns = [
    {
      title: "Title",

      dataIndex: "title",

      key: "title",

      render: (title, record) => (
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


    {
      title: "Status",

      dataIndex: "status",

      key: "status",

      render: (status) => (
        <Tag
          icon={
            status === "Published" ? (
              <CheckCircleOutlined />
            ) : (
              <ClockCircleOutlined />
            )
          }
          color={
            status === "Published"
              ? "success"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },


    {
      title: "Action",

      key: "action",

      render: (_, record) => (
        <Space>

          {/* PREVIEW */}

          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() =>
                handlePreview(record)
              }
            />
          </Tooltip>


          {/* EDIT */}

          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
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
                handleTogglePublish(record)
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
              handleDelete(record.id)
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


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
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
            Create, edit, publish, and manage
            public FloodGuard blog articles.
          </Text>

        </div>


        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Create New Blog
        </Button>

      </div>


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
              title="Total Blogs"
              value={totalPosts}
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
              value={publishedPosts}
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
              value={draftPosts}
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
              value={featuredPosts}
              prefix={
                <StarOutlined />
              }
            />
          </Card>
        </Col>

      </Row>


      {/* =====================================================
          BLOG LIST
      ===================================================== */}

      <Card
        title={
          <Space>
            <Badge status="processing" />

            <span>
              Blog Articles
            </span>
          </Space>
        }
      >

        {/* SEARCH */}

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
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
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
              value={statusFilter}
              onChange={
                setStatusFilter
              }
              options={[
                {
                  value: "all",
                  label:
                    "All Statuses",
                },
                {
                  value: "Published",
                  label:
                    "Published",
                },
                {
                  value: "Draft",
                  label: "Draft",
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
                  value: "all",
                  label:
                    "All Categories",
                },
                {
                  value:
                    "Flood Awareness",
                  label:
                    "Flood Awareness",
                },
                {
                  value:
                    "Technology",
                  label:
                    "Technology",
                },
                {
                  value:
                    "Research",
                  label:
                    "Research",
                },
                {
                  value: "Safety",
                  label: "Safety",
                },
              ]}
            />
          </Col>

        </Row>


        {/* TABLE */}

        <Table
          rowKey="id"
          columns={columns}
          dataSource={
            filteredPosts
          }
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showTotal: (total) =>
              `Total ${total} blogs`,
          }}
          scroll={{
            x: 700,
          }}
        />

      </Card>


      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      <Modal
        title={
          editingPost
            ? "Edit Blog"
            : "Create New Blog"
        }
        open={modalOpen}
        onCancel={closeModal}
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
                required: true,
                message:
                  "Please enter the blog title.",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Enter blog title"
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
                required: true,
                message:
                  "Please select a category.",
              },
            ]}
          >
            <Select
              size="large"
              placeholder="Select category"
              options={[
                {
                  value:
                    "Flood Awareness",
                  label:
                    "Flood Awareness",
                },
                {
                  value:
                    "Technology",
                  label:
                    "Technology",
                },
                {
                  value:
                    "Research",
                  label:
                    "Research",
                },
                {
                  value: "Safety",
                  label: "Safety",
                },
              ]}
            />
          </Form.Item>


          {/* =================================================
              FEATURED IMAGE
          ================================================= */}

          <Form.Item
            label="Featured Image"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={(event) =>
              event?.fileList || []
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
              SHORT DESCRIPTION
          ================================================= */}

          <Form.Item
            label="Short Description"
            name="excerpt"
            rules={[
              {
                required: true,
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
              RICH TEXT CONTENT
          ================================================= */}

          <Form.Item
            label="Content"
            name="content"
            rules={[
              {
                required: true,
                message:
                  "Please enter blog content.",
              },
            ]}
          >
            <ReactQuill
              theme="snow"
              modules={quillModules}
              formats={quillFormats}
              placeholder="Write your blog article here..."
              style={{
                minHeight: 280,
                marginBottom: 45,
              }}
            />
          </Form.Item>


          {/* =================================================
              PUBLICATION STATUS
          ================================================= */}

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


          {/* =================================================
              FEATURED BLOG
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
              display: "flex",
              justifyContent: "flex-end",
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
              Save Draft
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


      {/* =====================================================
          BLOG PREVIEW
      ===================================================== */}

      <Modal
        title="Blog Preview"
        open={previewOpen}
        onCancel={() =>
          setPreviewOpen(false)
        }
        footer={null}
        width={850}
      >

        {previewPost && (
          <div>

            <Space
              style={{
                marginBottom: 12,
              }}
            >

              <Tag color="blue">
                {previewPost.category}
              </Tag>

              <Tag
                color={
                  previewPost.status ===
                  "Published"
                    ? "success"
                    : "default"
                }
              >
                {previewPost.status}
              </Tag>

            </Space>


            <Title level={2}>
              {previewPost.title}
            </Title>


            <Text type="secondary">
              {previewPost.date}
            </Text>


            <Divider />


            <Paragraph>
              {previewPost.excerpt}
            </Paragraph>


            <Divider />


            <div
              dangerouslySetInnerHTML={{
                __html:
                  previewPost.content,
              }}
            />

          </div>
        )}

      </Modal>

    </div>
  );
};

export default Blog;