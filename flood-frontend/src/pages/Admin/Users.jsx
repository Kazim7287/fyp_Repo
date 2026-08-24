
import { useEffect, useState } from "react";

import {
  Card,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import {
  getUsers,
  createUser,
  updateUser,
  disableUser,
  enableUser,
} from "../../api/users.api";

const { Title, Text } = Typography;

const Users = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  // =========================================================
  // FETCH USERS
  // =========================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const data = await getUsers();

      setUsers(data?.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);

      message.error(
        error.response?.data?.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================================================
  // ROLE LABEL
  // =========================================================

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Administrator";

      case "common_user":
        return "Common User";

      default:
        return role || "Unknown";
    }
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (status) => {
    return status === "active"
      ? "Active"
      : "Disabled";
  };

  // =========================================================
  // ADD USER
  // =========================================================

  const handleAdd = () => {
    setEditingUser(null);

    form.resetFields();

    setModalOpen(true);
  };

  // =========================================================
  // EDIT USER
  // =========================================================

  const handleEdit = (user) => {
    setEditingUser(user);

    form.setFieldsValue({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
    });

    setModalOpen(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleCancel = () => {
    setModalOpen(false);

    form.resetFields();

    setEditingUser(null);

    setSubmitting(false);
  };

  // =========================================================
  // ENABLE / DISABLE USER
  // =========================================================

  const handleToggleStatus = (user) => {
    const isActive = user.status === "active";

    Modal.confirm({
      title: isActive
        ? "Disable User"
        : "Enable User",

      content: isActive
        ? `Are you sure you want to disable "${user.name}"?`
        : `Are you sure you want to enable "${user.name}"?`,

      okText: isActive
        ? "Disable"
        : "Enable",

      okType: isActive
        ? "danger"
        : "primary",

      cancelText: "Cancel",

      async onOk() {
        try {
          if (isActive) {
            await disableUser(user.id);
          } else {
            await enableUser(user.id);
          }

          message.success(
            isActive
              ? "User disabled successfully"
              : "User enabled successfully"
          );

          await fetchUsers();
        } catch (error) {
          console.error(
            "Status update error:",
            error
          );

          message.error(
            error.response?.data?.message ||
              "Failed to update user status"
          );

          throw error;
        }
      },
    });
  };

  // =========================================================
  // SUBMIT USER
  // =========================================================

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setSubmitting(true);

      // =====================================================
      // UPDATE EXISTING USER
      // =====================================================

      if (editingUser) {
        const payload = {
          name: values.name.trim(),
          email: values.email.trim(),
          role: values.role,
        };

        console.log(
          "Updating user:",
          editingUser.id,
          payload
        );

        await updateUser(
          editingUser.id,
          payload
        );

        message.success(
          "User updated successfully"
        );
      }

      // =====================================================
      // CREATE NEW USER
      // =====================================================

      else {
        const payload = {
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          role: values.role,
        };

        console.log(
          "Creating user:",
          {
            name: payload.name,
            email: payload.email,
            role: payload.role,
          }
        );

        await createUser(payload);

        message.success(
          "User created successfully"
        );
      }

      // =====================================================
      // REFRESH USERS
      // =====================================================

      await fetchUsers();

      // =====================================================
      // CLOSE MODAL
      // =====================================================

      handleCancel();

    } catch (error) {
      // Ant Design validation errors
      if (error?.errorFields) {
        setSubmitting(false);
        return;
      }

      console.error(
        "User submission error:",
        error
      );

      message.error(
        error.response?.data?.message ||
          "Failed to save user"
      );

      setSubmitting(false);
    }
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",

      render: (name) => (
        <Text strong>
          {name}
        </Text>
      ),
    },

    {
      title: "Email",
      dataIndex: "email",
      key: "email",

      render: (email) => (
        <Text>
          {email || "—"}
        </Text>
      ),
    },

    {
      title: "Role",
      dataIndex: "role",
      key: "role",

      render: (role) => (
        <Tag
          color={
            role === "admin"
              ? "blue"
              : "default"
          }
        >
          {getRoleLabel(role)}
        </Tag>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",

      render: (status) => (
        <Tag
          color={
            status === "active"
              ? "success"
              : "error"
          }
        >
          {getStatusLabel(status)}
        </Tag>
      ),
    },

    {
      title: "Actions",
      key: "actions",

      render: (_, user) => (
        <Space wrap>

          {/* EDIT */}

          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() =>
              handleEdit(user)
            }
          >
            Edit
          </Button>

          {/* ENABLE / DISABLE */}

          {user.status === "active" ? (
            <Button
              type="text"
              danger
              icon={<StopOutlined />}
              onClick={() =>
                handleToggleStatus(user)
              }
            >
              Disable
            </Button>
          ) : (
            <Button
              type="text"
              icon={
                <CheckCircleOutlined />
              }
              onClick={() =>
                handleToggleStatus(user)
              }
            >
              Enable
            </Button>
          )}

        </Space>
      ),
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >

        <div>

          <Title
            level={3}
            style={{
              marginBottom: 4,
            }}
          >
            User Management
          </Title>

          <Text type="secondary">
            Manage administrator and common user
            accounts.
          </Text>

        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add User
        </Button>

      </div>


      {/* =====================================================
          USERS TABLE
      ===================================================== */}

      <Card>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{
            pageSize: 10,
          }}
          scroll={{
            x: "max-content",
          }}
        />

      </Card>


      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      <Modal

        title={
          editingUser
            ? "Edit User"
            : "Add User"
        }

        open={modalOpen}

        onCancel={handleCancel}

        onOk={handleSubmit}

        okText={
          editingUser
            ? "Update"
            : "Create"
        }

        confirmLoading={submitting}

        width={550}

        destroyOnHidden
      >

        <Form
          form={form}
          layout="vertical"
        >

          {/* =================================================
              NAME
          ================================================= */}

          <Form.Item
            label="Name"
            name="name"

            rules={[
              {
                required: true,
                message:
                  "Please enter the user name",
              },
              {
                min: 2,
                message:
                  "Name must contain at least 2 characters",
              },
            ]}
          >

            <Input
              placeholder="Enter user name"
            />

          </Form.Item>


          {/* =================================================
              EMAIL
          ================================================= */}

          <Form.Item
            label="Email"
            name="email"

            rules={[
              {
                required: true,
                message:
                  "Please enter the user email",
              },
              {
                type: "email",
                message:
                  "Please enter a valid email address",
              },
            ]}
          >

            <Input
              placeholder="Enter user email"
            />

          </Form.Item>


          {/* =================================================
              PASSWORD
              ONLY REQUIRED WHEN CREATING USER
          ================================================= */}

          {!editingUser && (
            <Form.Item
              label="Password"
              name="password"

              rules={[
                {
                  required: true,
                  message:
                    "Please enter the user password",
                },
                {
                  min: 8,
                  message:
                    "Password must contain at least 8 characters",
                },
              ]}
            >

              <Input.Password
                placeholder="Enter user password"
              />

            </Form.Item>
          )}


          {/* =================================================
              ROLE
          ================================================= */}

          <Form.Item
            label="Role"
            name="role"

            rules={[
              {
                required: true,
                message:
                  "Please select a role",
              },
            ]}
          >

            <Select
              placeholder="Select user role"

              options={[
                {
                  label: "Common User",
                  value: "common_user",
                },
                {
                  label: "Administrator",
                  value: "admin",
                },
              ]}
            />

          </Form.Item>

        </Form>

      </Modal>

    </div>
  );
};

export default Users;
