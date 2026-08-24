import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Avatar,
  Dropdown,
  Space,
  Typography,
  message,
} from "antd";

import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { logout } from "../../api/auth.api";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  clearCredentials,
} from "../../store/slices/authSlice";

const { Title, Text } = Typography;

const AdminHeader = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  // =========================================================
  // AUTHENTICATED USER FROM REDUX
  // =========================================================

  const user = useAppSelector(
    (state) => state.auth.user
  );

  const [loggingOut, setLoggingOut] = useState(false);

  const [messageApi, contextHolder] =
    message.useMessage();

  // =========================================================
  // USER DISPLAY DATA
  // =========================================================

  const userName = user?.name || "Administrator";

  const userRole =
    user?.role === "admin"
      ? "System Admin"
      : "User";

  const avatarLetter =
    user?.name?.charAt(0)?.toUpperCase() || "U";

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();

      // Clear Redux authentication state
      dispatch(clearCredentials());

      messageApi.success(
        "Logged out successfully"
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 300);

    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      // Even if backend logout fails,
      // clear frontend authentication state.
      dispatch(clearCredentials());

      messageApi.warning(
        "Session ended. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 300);

    } finally {
      setLoggingOut(false);
    }
  };

  // =========================================================
  // PROFILE MENU
  // =========================================================

  const profileMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: userName,
    },

    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Account Settings",
    },

    {
      type: "divider",
    },

    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  // =========================================================
  // MENU CLICK
  // =========================================================

  const handleMenuClick = ({ key }) => {
    if (key === "profile") {
      navigate("/admin/profile");
      return;
    }

    if (key === "settings") {
      navigate("/admin/settings");
      return;
    }

    if (key === "logout") {
      handleLogout();
      return;
    }
  };

  // =========================================================
  // HEADER
  // =========================================================

  return (
    <>
      {contextHolder}

      <header
        style={{
          height: 64,
          width: "100%",

          padding: "0 28px",

          background: "#ffffff",

          borderBottom:
            "1px solid #e8e8e8",

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          boxSizing: "border-box",

          flexShrink: 0,

          position: "relative",
          zIndex: 2000,
        }}
      >

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div
          style={{
            minWidth: 0,
          }}
        >
          <Title
            level={4}
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: "#1f1f1f",
              whiteSpace: "nowrap",
            }}
          >
            Admin Dashboard
          </Title>
        </div>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <Space
          size={22}
          align="center"
        >

          {/* SYSTEM STATUS */}

          <Space
            size={8}
            style={{
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",

                background: "#52c41a",

                display: "inline-block",

                boxShadow:
                  "0 0 0 3px rgba(82,196,26,0.10)",
              }}
            />

            <Text
              type="secondary"
              style={{
                fontSize: 13,
              }}
            >
              System Online
            </Text>
          </Space>

          {/* =================================================
              PROFILE DROPDOWN
          ================================================= */}

          <Dropdown
            menu={{
              items: profileMenuItems,
              onClick: handleMenuClick,
            }}
            trigger={["click"]}
            placement="bottomRight"
            arrow
          >

            <div
              role="button"
              tabIndex={0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,

                padding: "5px 8px",

                borderRadius: 8,

                cursor: loggingOut
                  ? "wait"
                  : "pointer",

                userSelect: "none",

                transition:
                  "background 0.2s ease",

                opacity: loggingOut
                  ? 0.6
                  : 1,
              }}

              onMouseEnter={(e) => {
                if (!loggingOut) {
                  e.currentTarget.style.background =
                    "#f5f5f5";
                }
              }}

              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "transparent";
              }}
            >

              {/* =================================================
                  AVATAR
              ================================================= */}

              <Avatar
                size={36}
                style={{
                  background: "#f0f5ff",
                  color: "#1677ff",
                  flexShrink: 0,
                  fontWeight: 600,
                }}
              >
                {avatarLetter}
              </Avatar>

              {/* =================================================
                  USER INFO
              ================================================= */}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",

                  lineHeight: 1.2,
                }}
              >

                <Text
                  strong
                  style={{
                    fontSize: 13,
                    color: "#262626",
                  }}
                >
                  {userName}
                </Text>

                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                  }}
                >
                  {userRole}
                </Text>

              </div>

            </div>

          </Dropdown>

        </Space>

      </header>
    </>
  );
};

export default AdminHeader;