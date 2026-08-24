import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Flex,
} from "antd";

import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  UserAddOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import { register } from "../../api/auth.api";

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (values) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await register({
        name: values.name.trim(),
        email: values.email.toLowerCase().trim(),
        password: values.password,
      });

      console.log("Registration successful:", data);

      setSuccess(
        "Registration successful. You can now sign in."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",

        background:
          "linear-gradient(135deg, #f0f5ff 0%, #f5f7fa 50%, #e6f7ff 100%)",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        padding: "24px",

        boxSizing: "border-box",
      }}
    >
      <Card
        variant="borderless"
        style={{
          width: "100%",
          maxWidth: 430,

          borderRadius: 16,

          boxShadow:
            "0 12px 40px rgba(0, 0, 0, 0.08)",

          overflow: "hidden",
        }}
        styles={{
          body: {
            padding: 0,
          },
        }}
      >

        {/* HEADER */}

        <div
          style={{
            padding: "34px 34px 26px",
            textAlign: "center",
            background: "#ffffff",
          }}
        >
          <Flex
            align="center"
            justify="center"
            style={{
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,

                borderRadius: 14,

                background:
                  "linear-gradient(135deg, #1677ff, #0958d9)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                color: "#ffffff",

                fontSize: 24,
                fontWeight: 700,

                boxShadow:
                  "0 8px 20px rgba(22,119,255,0.25)",
              }}
            >
              FF
            </div>
          </Flex>

          <Title
            level={2}
            style={{
              margin: 0,
              fontSize: 25,
              fontWeight: 650,
              color: "#1f1f1f",
            }}
          >
            Create Account
          </Title>

          <Text
            type="secondary"
            style={{
              display: "block",
              marginTop: 6,
              fontSize: 14,
            }}
          >
            Flood Forecasting System
          </Text>
        </div>

        {/* FORM */}

        <div
          style={{
            padding: "0 34px 34px",
          }}
        >

          {error && (
            <Alert
              type="error"
              showIcon
              message={error}
              style={{
                marginBottom: 20,
                borderRadius: 8,
              }}
            />
          )}

          {success && (
            <Alert
              type="success"
              showIcon
              message={success}
              style={{
                marginBottom: 20,
                borderRadius: 8,
              }}
            />
          )}

          <Form
            layout="vertical"
            requiredMark={false}
            onFinish={handleSubmit}
            size="large"
          >

            {/* NAME */}

            <Form.Item
              label="Full Name"
              name="name"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter your name.",
                },
                {
                  min: 2,
                  message:
                    "Name must be at least 2 characters.",
                },
              ]}
            >
              <Input
                prefix={
                  <UserOutlined
                    style={{
                      color: "#8c8c8c",
                    }}
                  />
                }
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </Form.Item>

            {/* EMAIL */}

            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter your email address.",
                },
                {
                  type: "email",
                  message:
                    "Please enter a valid email address.",
                },
              ]}
            >
              <Input
                prefix={
                  <MailOutlined
                    style={{
                      color: "#8c8c8c",
                    }}
                  />
                }
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Form.Item>

            {/* PASSWORD */}

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter a password.",
                },
                {
                  min: 6,
                  message:
                    "Password must be at least 6 characters.",
                },
              ]}
            >
              <Input.Password
                prefix={
                  <LockOutlined
                    style={{
                      color: "#8c8c8c",
                    }}
                  />
                }
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </Form.Item>

            {/* CONFIRM PASSWORD */}

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message:
                    "Please confirm your password.",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (
                      !value ||
                      getFieldValue("password") === value
                    ) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error(
                        "Passwords do not match."
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={
                  <LockOutlined
                    style={{
                      color: "#8c8c8c",
                    }}
                  />
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </Form.Item>

            {/* REGISTER */}

            <Form.Item
              style={{
                marginTop: 26,
                marginBottom: 20,
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                icon={
                  !loading && (
                    <UserAddOutlined />
                  )
                }
                style={{
                  height: 48,
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,

                  boxShadow:
                    "0 5px 14px rgba(22,119,255,0.20)",
                }}
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
            </Form.Item>

          </Form>

          {/* LOGIN LINK */}

          <Flex
            justify="center"
            align="center"
            gap={4}
            style={{
              marginTop: 10,
            }}
          >
            <Text type="secondary">
              Already have an account?
            </Text>

            <Link to="/login">
              Sign in
            </Link>
          </Flex>

          {/* SECURITY */}

          <Flex
            align="center"
            justify="center"
            gap={7}
            style={{
              marginTop: 20,
              color: "#8c8c8c",
              fontSize: 12,
            }}
          >
            <SafetyCertificateOutlined />

            <span>
              Secure account registration
            </span>
          </Flex>

        </div>
      </Card>
    </div>
  );
};

export default Register;