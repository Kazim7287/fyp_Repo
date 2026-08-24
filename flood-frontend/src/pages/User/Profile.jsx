
import {
  Card,
  Avatar,
  Typography,
  Row,
  Col,
  Descriptions,
  Tag,
  Button,
  Space,
  Divider,
} from "antd";

import {
  UserOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Profile = () => {
  // =========================================================
  // TEMPORARY USER DATA
  // Replace with authenticated user data later.
  // =========================================================

  const user = {
    name: "Muhammad Ahmad",
    email: "user@example.com",
    role: "common_user",
    status: "active",
    memberSince: "August 2026",
  };

  return (
    <div
      style={{
        minHeight: "100%",
        padding: 24,
        background: "#f5f7fa",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={{ marginBottom: 24 }}>
        <Title
          level={2}
          style={{
            marginBottom: 5,
          }}
        >
          Profile
        </Title>

        <Text type="secondary">
          Manage your personal account information.
        </Text>
      </div>

      {/* =====================================================
          PROFILE HEADER
      ===================================================== */}

      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          marginBottom: 20,
          boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
        }}
      >
        <Row
          gutter={[24, 24]}
          align="middle"
        >
          <Col>
            <Avatar
              size={90}
              icon={<UserOutlined />}
              style={{
                background: "#1677ff",
                fontSize: 36,
              }}
            />
          </Col>

          <Col flex="1">
            <Title
              level={3}
              style={{
                margin: 0,
              }}
            >
              {user.name}
            </Title>

            <Text
              type="secondary"
              style={{
                display: "block",
                marginTop: 5,
              }}
            >
              {user.email}
            </Text>

            <Space
              style={{
                marginTop: 10,
              }}
            >
              <Tag
                color="blue"
                style={{
                  borderRadius: 6,
                }}
              >
                Common User
              </Tag>

              <Tag
                color="green"
                style={{
                  borderRadius: 6,
                }}
              >
                Active
              </Tag>
            </Space>
          </Col>

          <Col>
            <Button
              icon={<EditOutlined />}
            >
              Edit Profile
            </Button>
          </Col>
        </Row>
      </Card>

      {/* =====================================================
          ACCOUNT INFORMATION
      ===================================================== */}

      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          marginBottom: 20,
          boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
        }}
      >
        <Title
          level={4}
          style={{
            marginTop: 0,
          }}
        >
          Account Information
        </Title>

        <Divider />

        <Descriptions
          column={{
            xs: 1,
            sm: 2,
          }}
          bordered
        >
          <Descriptions.Item
            label="Full Name"
          >
            {user.name}
          </Descriptions.Item>

          <Descriptions.Item
            label="Email Address"
          >
            <Space>
              <MailOutlined />
              {user.email}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item
            label="Account Type"
          >
            <Tag color="blue">
              Common User
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label="Account Status"
          >
            <Tag color="green">
              Active
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label="Member Since"
          >
            {user.memberSince}
          </Descriptions.Item>

          <Descriptions.Item
            label="Security"
          >
            <Space>
              <SafetyCertificateOutlined
                style={{
                  color: "#52c41a",
                }}
              />

              <Text>
                Account protected
              </Text>
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* =====================================================
          ACCOUNT SECURITY
      ===================================================== */}

      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
        }}
      >
        <Title
          level={4}
          style={{
            marginTop: 0,
          }}
        >
          Account Security
        </Title>

        <Divider />

        <Row
          justify="space-between"
          align="middle"
          gutter={[16, 16]}
        >
          <Col>
            <Text strong>
              Password
            </Text>

            <Text
              type="secondary"
              style={{
                display: "block",
                marginTop: 4,
              }}
            >
              Change your account password.
            </Text>
          </Col>

          <Col>
            <Button>
              Change Password
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Profile;

