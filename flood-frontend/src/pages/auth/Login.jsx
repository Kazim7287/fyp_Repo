import { useEffect, useState } from "react";
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
  MailOutlined,
  LockOutlined,
  LoginOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import {
  login,
  getCurrentUser,
  logout,
} from "../../api/auth.api";

import {
  setCredentials,
  clearCredentials,
} from "../../store/slices/authSlice";

import { useAppDispatch } from "../../hooks/redux";

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // =========================================================
  // CHECK EXISTING AUTHENTICATED SESSION
  // =========================================================

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking existing session...");

        const data = await getCurrentUser();

        console.log("Current user:", data);

        if (data?.success && data?.user) {
          setCurrentUser(data.user);

          dispatch(setCredentials(data.user));
        } else {
          setCurrentUser(null);
          dispatch(clearCredentials());
        }
      } catch (error) {
        console.log("No active session.");

        setCurrentUser(null);
        dispatch(clearCredentials());
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [dispatch]);

  // =========================================================
  // DASHBOARD NAVIGATION
  // =========================================================

  const handleDashboardNavigation = () => {
    if (!currentUser) return;

    if (
      currentUser.role === "admin" ||
      currentUser.role === "administrator"
    ) {
      navigate("/admin/dashboard", {
        replace: true,
      });

      return;
    }

    if (currentUser.role === "common_user") {
      navigate("/user/dashboard", {
        replace: true,
      });

      return;
    }

    setError(
      "Your account does not have a valid system role."
    );
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleSubmit = async (values) => {
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login...");

      const data = await login(values);

      console.log("Login response:", data);

      if (!data?.success || !data?.user) {
        throw new Error(
          "Invalid login response from server."
        );
      }

      const user = data.user;

      console.log("Authenticated user:", user);

      // -------------------------------------------------------
      // NO LOCAL STORAGE
      // Authentication is maintained through HTTP-only cookie.
      // Redux stores the current authentication state.
      // -------------------------------------------------------

      dispatch(setCredentials(user));
      setCurrentUser(user);

      // -------------------------------------------------------
      // REDIRECT BASED ON ROLE
      // -------------------------------------------------------

      if (
        user.role === "admin" ||
        user.role === "administrator"
      ) {
        navigate("/admin/dashboard", {
          replace: true,
        });

        return;
      }

      if (user.role === "common_user") {
        navigate("/user/dashboard", {
          replace: true,
        });

        return;
      }

      setError(
        "Your account does not have a valid system role."
      );
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      console.log("Logging out...");

      await logout();

      // Clear Redux authentication state
      dispatch(clearCredentials());

      // Clear local page state
      setCurrentUser(null);

      console.log("Logout successful.");
    } catch (error) {
      console.error("Logout error:", error);

      // Even if backend logout fails,
      // clear frontend authentication state.
      dispatch(clearCredentials());
      setCurrentUser(null);

      setError(
        "Session ended. You can sign in again."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  // =========================================================
  // LOADING SESSION
  // =========================================================

  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          width: "100%",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          background:
            "linear-gradient(135deg, #f0f5ff 0%, #f5f7fa 50%, #e6f7ff 100%)",
        }}
      >
        <Text type="secondary">
          Checking your session...
        </Text>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

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
        {/* =================================================
            HEADER
        ================================================= */}

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
            Flood Forecasting
          </Title>

          <Text
            type="secondary"
            style={{
              display: "block",
              marginTop: 6,
              fontSize: 14,
            }}
          >
            {currentUser
              ? `Welcome back, ${currentUser.name || "User"}`
              : "Sign in to your account"}
          </Text>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          style={{
            padding: "0 34px 34px",
          }}
        >
          {/* ERROR */}

          {error && (
            <Alert
              type="error"
              showIcon
              title={error}
              style={{
                marginBottom: 20,
                borderRadius: 8,
              }}
            />
          )}

          {/* =================================================
              NOT LOGGED IN
          ================================================= */}

          {!currentUser && (
            <>
              <Form
                layout="vertical"
                requiredMark={false}
                onFinish={handleSubmit}
                size="large"
              >
                {/* EMAIL */}

                <Form.Item
                  label={
                    <span
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Email Address
                    </span>
                  }
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
                  label={
                    <span
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Password
                    </span>
                  }
                  name="password"
                  rules={[
                    {
                      required: true,
                      message:
                        "Please enter your password.",
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
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </Form.Item>

                {/* LOGIN BUTTON */}

                <Form.Item
                  style={{
                    marginTop: 26,
                    marginBottom: 18,
                  }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    icon={
                      !loading && <LoginOutlined />
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
                      ? "Signing in..."
                      : "Sign In"}
                  </Button>
                </Form.Item>
              </Form>

              {/* CREATE ACCOUNT */}

              <div
                style={{
                  textAlign: "center",
                  marginTop: 4,
                  marginBottom: 22,
                }}
              >
                <Text type="secondary">
                  Don't have an account?{" "}
                </Text>

                <Link
                  to="/register"
                  style={{
                    fontWeight: 600,
                  }}
                >
                  Create Account
                </Link>
              </div>
            </>
          )}

          {/* =================================================
              ALREADY LOGGED IN
          ================================================= */}

          {currentUser && (
            <Flex
              vertical
              gap={12}
              style={{
                marginTop: 10,
                marginBottom: 22,
              }}
            >
              {/* USER INFORMATION */}

              <div
                style={{
                  textAlign: "center",
                  padding: "12px 0 8px",
                }}
              >
                <Text
                  strong
                  style={{
                    display: "block",
                    fontSize: 16,
                  }}
                >
                  {currentUser.name || "User"}
                </Text>

                <Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                  }}
                >
                  {currentUser.role === "common_user"
                    ? "Common User"
                    : "Administrator"}
                </Text>
              </div>

              {/* DASHBOARD */}

              <Button
                type="primary"
                block
                icon={<DashboardOutlined />}
                onClick={handleDashboardNavigation}
                style={{
                  height: 46,
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Go to Dashboard
              </Button>

              {/* LOGOUT */}

              <Button
                danger
                block
                icon={<LogoutOutlined />}
                loading={loggingOut}
                onClick={handleLogout}
                style={{
                  height: 46,
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                {loggingOut
                  ? "Logging out..."
                  : "Logout"}
              </Button>
            </Flex>
          )}

          {/* =================================================
              SECURITY INFORMATION
          ================================================= */}

          <Flex
            align="center"
            justify="center"
            gap={7}
            style={{
              color: "#8c8c8c",
              fontSize: 12,
            }}
          >
            <SafetyCertificateOutlined />

            <span>
              Secure account access
            </span>
          </Flex>
        </div>
      </Card>
    </div>
  );
};

export default Login;