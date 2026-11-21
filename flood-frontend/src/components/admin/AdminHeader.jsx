
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Avatar,
  Dropdown,
  Typography,
  message,
} from "antd";

import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DownOutlined,
} from "@ant-design/icons";

import { logout } from "../../api/auth.api";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  clearCredentials,
} from "../../store/slices/authSlice";

import "./styles/AdminHeader.css";

const { Text } = Typography;

const ADMIN_PAGES = [
  { path: "/admin/dashboard", title: "Dashboard" },
  { path: "/admin/monitoring", title: "Live Monitoring" },
  { path: "/admin/flood-map", title: "Flood Map" },
  { path: "/admin/ai", title: "AI & Forecasting" },
  { path: "/admin/environmental-data", title: "Environmental Data" },
  { path: "/admin/iot", title: "IoT Infrastructure" },
  { path: "/admin/alerts", title: "Alerts" },
  { path: "/admin/reports", title: "Reports & Data" },
  { path: "/admin/content", title: "Content Management" },
  { path: "/admin/media-library", title: "Media Library" },
  { path: "/admin/users", title: "Users" },
  { path: "/admin/settings", title: "Settings" },
  { path: "/admin/logs", title: "System Logs" },
];

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  const [loggingOut, setLoggingOut] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // =========================================================
  // USER INFORMATION
  // =========================================================

  const userName = user?.name || "Administrator";

  const userRole =
    user?.role === "admin"
      ? "System Admin"
      : user?.role || "User";

  const avatarLetter =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

  // =========================================================
  // DYNAMIC PAGE TITLE
  // =========================================================

  const pageTitle = useMemo(() => {
    const matchedPage = ADMIN_PAGES
      .filter(
        (page) =>
          location.pathname === page.path ||
          location.pathname.startsWith(`${page.path}/`)
      )
      .sort((a, b) => b.path.length - a.path.length)[0];

    return matchedPage?.title || "Admin Dashboard";
  }, [location.pathname]);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();

      messageApi.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);

      messageApi.warning(
        "Your session has ended. Redirecting to login..."
      );
    } finally {
      dispatch(clearCredentials());

      navigate("/login", {
        replace: true,
      });

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
      label: "My Profile",
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
      label: loggingOut ? "Logging out..." : "Logout",
      danger: true,
      disabled: loggingOut,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "profile") {
      navigate("/admin/profile");
    }

    if (key === "settings") {
      navigate("/admin/settings");
    }

    if (key === "logout") {
      handleLogout();
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {contextHolder}

      <header className="admin-header">

        {/* LEFT: PAGE INFORMATION */}
        <div className="admin-header-left">
          <div className="admin-header-page-info">
            <Text className="admin-header-page-title">
              {pageTitle}
            </Text>

            <Text className="admin-header-page-subtitle">
              Flood Forecasting & Monitoring System
            </Text>
          </div>
        </div>

        {/* RIGHT: STATUS AND PROFILE */}
        <div className="admin-header-right">

          {/* SYSTEM STATUS */}
          <div
            className="admin-system-status"
            title="Application status indicator"
          >
            <span className="admin-status-indicator" />

            <Text className="admin-status-text">
              System Online
            </Text>
          </div>

          {/* PROFILE DROPDOWN */}
          <Dropdown
            menu={{
              items: profileMenuItems,
              onClick: handleMenuClick,
            }}
            trigger={["click"]}
            placement="bottomRight"
            arrow
          >
            <button
              type="button"
              className="admin-header-profile"
              disabled={loggingOut}
              aria-label="Open administrator menu"
            >
              <Avatar className="admin-header-avatar">
                {avatarLetter}
              </Avatar>

              <div className="admin-header-user-info">
                <Text className="admin-header-user-name">
                  {userName}
                </Text>

                <Text className="admin-header-user-role">
                  {userRole}
                </Text>
              </div>

              <DownOutlined className="admin-header-dropdown-icon" />
            </button>
          </Dropdown>

        </div>
      </header>
    </>
  );
};

export default AdminHeader;
