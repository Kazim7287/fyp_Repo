import { useState } from "react";

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
  DatePicker,
  Switch,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Empty,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

const { Title, Text } = Typography;

const { TextArea } = Input;

const { Option } = Select;


/* =========================================================
   SAMPLE ANNOUNCEMENT DATA
========================================================= */

const initialAnnouncements = [
  {
    id: 1,
    title: "Flood Monitoring System Activated",
    category: "System Update",
    priority: "High",
    status: "Published",
    publishedAt: "2026-08-20",
    expiresAt: "2026-09-20",
    author: "Administrator",
    content:
      "The flood monitoring and early-warning system is now actively monitoring designated stations.",
  },

  {
    id: 2,
    title: "Heavy Rainfall Advisory",
    category: "Weather Advisory",
    priority: "Critical",
    status: "Published",
    publishedAt: "2026-08-19",
    expiresAt: "2026-08-25",
    author: "Administrator",
    content:
      "Residents in vulnerable areas are advised to remain alert due to expected heavy rainfall.",
  },

  {
    id: 3,
    title: "Scheduled System Maintenance",
    category: "Maintenance",
    priority: "Medium",
    status: "Draft",
    publishedAt: null,
    expiresAt: null,
    author: "Administrator",
    content:
      "The monitoring platform will undergo scheduled maintenance.",
  },

  {
    id: 4,
    title: "Emergency Preparedness Information",
    category: "Emergency",
    priority: "High",
    status: "Archived",
    publishedAt: "2026-07-15",
    expiresAt: "2026-08-01",
    author: "Administrator",
    content:
      "Emergency preparedness guidelines for communities located near flood-prone areas.",
  },
];


/* =========================================================
   COMPONENT
========================================================= */

const Announcements = () => {

  const [announcements, setAnnouncements] =
    useState(initialAnnouncements);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingAnnouncement, setEditingAnnouncement] =
    useState(null);

  const [viewAnnouncement, setViewAnnouncement] =
    useState(null);

  const [form] = Form.useForm();


  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalAnnouncements =
    announcements.length;

  const publishedAnnouncements =
    announcements.filter(
      (item) =>
        item.status === "Published"
    ).length;

  const draftAnnouncements =
    announcements.filter(
      (item) =>
        item.status === "Draft"
    ).length;

  const highPriorityAnnouncements =
    announcements.filter(
      (item) =>
        item.priority === "High" ||
        item.priority === "Critical"
    ).length;


  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreate = () => {

    setEditingAnnouncement(null);

    form.resetFields();

    setModalOpen(true);
  };


  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (record) => {

    setEditingAnnouncement(record);

    form.setFieldsValue({
      title: record.title,
      category: record.category,
      priority: record.priority,
      status: record.status,
      publishedAt: record.publishedAt
        ? dayjs(record.publishedAt)
        : null,
      expiresAt: record.expiresAt
        ? dayjs(record.expiresAt)
        : null,
      content: record.content,
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

      const announcementData = {

        title: values.title,

        category: values.category,

        priority: values.priority,

        status: values.status,

        publishedAt:
          values.publishedAt
            ? values.publishedAt.format(
                "YYYY-MM-DD"
              )
            : null,

        expiresAt:
          values.expiresAt
            ? values.expiresAt.format(
                "YYYY-MM-DD"
              )
            : null,

        content: values.content,

        author: "Administrator",
      };


      /* =================================================
         UPDATE EXISTING
      ================================================= */

      if (editingAnnouncement) {

        setAnnouncements((previous) =>
          previous.map((item) =>
            item.id ===
            editingAnnouncement.id
              ? {
                  ...item,
                  ...announcementData,
                }
              : item
          )
        );

        message.success(
          "Announcement updated successfully."
        );

      }

      /* =================================================
         CREATE NEW
      ================================================= */

      else {

        const newAnnouncement = {

          id:
            Date.now(),

          ...announcementData,
        };

        setAnnouncements((previous) => [
          newAnnouncement,
          ...previous,
        ]);

        message.success(
          "Announcement created successfully."
        );
      }

      setModalOpen(false);

      form.resetFields();

    }

    catch (error) {

      // Validation errors are handled by Ant Design.

    }
  };


  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = (id) => {

    setAnnouncements((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    message.success(
      "Announcement deleted successfully."
    );
  };


  /* =======================================================
     PUBLISH / UNPUBLISH
  ======================================================= */

  const handleStatusChange = (
    record,
    checked
  ) => {

    const newStatus =
      checked
        ? "Published"
        : "Draft";

    setAnnouncements((previous) =>
      previous.map((item) =>
        item.id === record.id
          ? {
              ...item,
              status: newStatus,
              publishedAt:
                checked
                  ? dayjs().format(
                      "YYYY-MM-DD"
                    )
                  : item.publishedAt,
            }
          : item
      )
    );

    message.success(
      checked
        ? "Announcement published."
        : "Announcement moved to draft."
    );
  };


  /* =======================================================
     STATUS TAG
  ======================================================= */

  const renderStatus = (status) => {

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

    if (status === "Draft") {

      return (
        <Tag
          icon={<FileTextOutlined />}
          color="default"
        >
          Draft
        </Tag>
      );
    }

    if (status === "Archived") {

      return (
        <Tag
          icon={<ClockCircleOutlined />}
          color="orange"
        >
          Archived
        </Tag>
      );
    }

    return <Tag>{status}</Tag>;
  };


  /* =======================================================
     PRIORITY TAG
  ======================================================= */

  const renderPriority = (priority) => {

    const colors = {
      Critical: "error",
      High: "warning",
      Medium: "blue",
      Low: "default",
    };

    return (
      <Tag
        color={
          colors[priority] ||
          "default"
        }
      >
        {priority}
      </Tag>
    );
  };


  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = [

    {
      title: "Announcement",
      dataIndex: "title",
      key: "title",

      render: (title, record) => (
        <div>

          <Text strong>
            {title}
          </Text>

          <br />

          <Text
            type="secondary"
            style={{
              fontSize: 12,
            }}
          >
            {record.category}
          </Text>

        </div>
      ),
    },


    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",

      render: (priority) =>
        renderPriority(priority),
    },


    {
      title: "Status",
      dataIndex: "status",
      key: "status",

      render: (status) =>
        renderStatus(status),
    },


    {
      title: "Published",
      dataIndex: "publishedAt",
      key: "publishedAt",

      render: (date) =>
        date || (
          <Text type="secondary">
            Not published
          </Text>
        ),
    },


    {
      title: "Author",
      dataIndex: "author",
      key: "author",
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
              setViewAnnouncement(
                record
              )
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
            title="Delete this announcement?"
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
            Announcements
          </Title>

          <Text type="secondary">
            Create, publish, edit, and manage
            public announcements and important
            system updates.
          </Text>

        </div>


        <Button
          type="primary"
          icon={
            <PlusOutlined />
          }
          onClick={handleCreate}
        >
          Create Announcement
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
              title="Total Announcements"
              value={
                totalAnnouncements
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
                publishedAnnouncements
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
                draftAnnouncements
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
              title="High Priority"
              value={
                highPriorityAnnouncements
              }
              prefix={
                <ExclamationCircleOutlined />
              }
            />

          </Card>

        </Col>

      </Row>


      {/* ===================================================
          ANNOUNCEMENTS TABLE
      =================================================== */}

      <Card
        title="Announcement Management"
      >

        {announcements.length > 0 ? (

          <Table
            rowKey="id"
            columns={columns}
            dataSource={
              announcements
            }
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
            scroll={{
              x: 900,
            }}
          />

        ) : (

          <Empty
            description="No announcements available"
          />

        )}

      </Card>


      {/* ===================================================
          CREATE / EDIT MODAL
      =================================================== */}

      <Modal
        title={
          editingAnnouncement
            ? "Edit Announcement"
            : "Create Announcement"
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSave}
        okText={
          editingAnnouncement
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

          {/* TITLE */}

          <Form.Item
            label="Announcement Title"
            name="title"
            rules={[
              {
                required: true,
                message:
                  "Please enter announcement title.",
              },
            ]}
          >

            <Input
              placeholder="Enter announcement title"
              maxLength={150}
              showCount
            />

          </Form.Item>


          {/* CATEGORY + PRIORITY */}

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
                      "Please select a category.",
                  },
                ]}
              >

                <Select
                  placeholder="Select category"
                >

                  <Option value="System Update">
                    System Update
                  </Option>

                  <Option value="Weather Advisory">
                    Weather Advisory
                  </Option>

                  <Option value="Emergency">
                    Emergency
                  </Option>

                  <Option value="Maintenance">
                    Maintenance
                  </Option>

                  <Option value="Public Notice">
                    Public Notice
                  </Option>

                </Select>

              </Form.Item>

            </Col>


            <Col
              xs={24}
              sm={12}
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
                >

                  <Option value="Critical">
                    Critical
                  </Option>

                  <Option value="High">
                    High
                  </Option>

                  <Option value="Medium">
                    Medium
                  </Option>

                  <Option value="Low">
                    Low
                  </Option>

                </Select>

              </Form.Item>

            </Col>

          </Row>


          {/* STATUS */}

          <Form.Item
            label="Publication Status"
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

              <Option value="Archived">
                Archived
              </Option>

            </Select>

          </Form.Item>


          {/* DATES */}

          <Row
            gutter={16}
          >

            <Col
              xs={24}
              sm={12}
            >

              <Form.Item
                label="Publish Date"
                name="publishedAt"
              >

                <DatePicker
                  style={{
                    width: "100%",
                  }}
                />

              </Form.Item>

            </Col>


            <Col
              xs={24}
              sm={12}
            >

              <Form.Item
                label="Expiry Date"
                name="expiresAt"
              >

                <DatePicker
                  style={{
                    width: "100%",
                  }}
                />

              </Form.Item>

            </Col>

          </Row>


          {/* CONTENT */}

          <Form.Item
            label="Announcement Content"
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
              maxLength={3000}
            />

          </Form.Item>

        </Form>

      </Modal>


      {/* ===================================================
          VIEW MODAL
      =================================================== */}

      <Modal
        title="Announcement Preview"
        open={
          !!viewAnnouncement
        }
        footer={null}
        onCancel={() =>
          setViewAnnouncement(null)
        }
        width={700}
      >

        {viewAnnouncement && (

          <div>

            <Title
              level={3}
            >
              {
                viewAnnouncement.title
              }
            </Title>


            <Space
              wrap
              style={{
                marginBottom: 16,
              }}
            >

              {renderStatus(
                viewAnnouncement.status
              )}

              {renderPriority(
                viewAnnouncement.priority
              )}

              <Tag>
                {
                  viewAnnouncement.category
                }
              </Tag>

            </Space>


            <div
              style={{
                marginBottom: 16,
              }}
            >

              <Text type="secondary">
                Published:{" "}
              </Text>

              <Text>
                {
                  viewAnnouncement.publishedAt ||
                  "Not published"
                }
              </Text>

            </div>


            <div
              style={{
                marginBottom: 16,
              }}
            >

              <Text type="secondary">
                Expires:{" "}
              </Text>

              <Text>
                {
                  viewAnnouncement.expiresAt ||
                  "No expiry date"
                }
              </Text>

            </div>


            <Card
              size="small"
              style={{
                background:
                  "#f5f7fa",
              }}
            >

              <Text>
                {
                  viewAnnouncement.content
                }
              </Text>

            </Card>

          </div>

        )}

      </Modal>

    </div>
  );
};


export default Announcements;