import { NavLink } from "react-router-dom";

import {
  DashboardOutlined,
  RadarChartOutlined,
  EnvironmentOutlined,
  RobotOutlined,
  CloudOutlined,
  ApiOutlined,
  AlertOutlined,
  BarChartOutlined,
  EditOutlined,
  PictureOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

import { Avatar, Typography } from "antd";

import { useAppSelector } from "../../hooks/redux";

const { Text } = Typography;

// =========================================================
// ADMIN MENU
// =========================================================

const menuItems = [
  {
    label: "Dashboard",
    icon: <DashboardOutlined />,
    path: "/admin/dashboard",
  },

  {
    label: "Live Monitoring",
    icon: <RadarChartOutlined />,
    path: "/admin/monitoring",
  },

  {
    label: "Flood Map",
    icon: <EnvironmentOutlined />,
    path: "/admin/flood-map",
  },

  {
    label: "AI & Forecasting",
    icon: <RobotOutlined />,
    path: "/admin/ai",
  },

  {
    label: "Environmental Data",
    icon: <CloudOutlined />,
    path: "/admin/environmental-data",
  },

  {
    label: "IoT Infrastructure",
    icon: <ApiOutlined />,
    path: "/admin/iot",
  },

  {
    label: "Alerts",
    icon: <AlertOutlined />,
    path: "/admin/alerts",
  },

  {
    label: "Reports & Data",
    icon: <BarChartOutlined />,
    path: "/admin/reports",
  },

  {
    label: "Content Management",
    icon: <EditOutlined />,
    path: "/admin/content",
  },

  {
    label: "Media Library",
    icon: <PictureOutlined />,
    path: "/admin/media-library",
  },

  {
    label: "Users",
    icon: <UserOutlined />,
    path: "/admin/users",
  },

  {
    label: "Settings",
    icon: <SettingOutlined />,
    path: "/admin/settings",
  },

  {
    label: "System Logs",
    icon: <FileTextOutlined />,
    path: "/admin/logs",
  },
];

// =========================================================
// SIDEBAR
// =========================================================

const AdminSidebar = () => {

  // =======================================================
  // GET AUTHENTICATED USER FROM REDUX
  // =======================================================

  const user = useAppSelector(
    (state) => state.auth.user
  );

  // =======================================================
  // USER DISPLAY DATA
  // =======================================================

  const userName =
    user?.name || "Administrator";

  const userRole =
    user?.role === "admin"
      ? "System Admin"
      : "User";

  const avatarLetter =
    user?.name?.charAt(0)?.toUpperCase() || "U";

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <aside className="admin-sidebar">

      {/* =========================================
          SIDEBAR HEADER
      ========================================= */}

      <div className="admin-sidebar-header">

        <h2>
          FloodGuard
        </h2>

        <span>
          ADMIN PORTAL
        </span>

      </div>

      {/* =========================================
          NAVIGATION
      ========================================= */}

      <nav className="admin-sidebar-nav">

        {menuItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            end={
              item.path ===
              "/admin/dashboard"
            }
            className={({ isActive }) =>
              `admin-nav-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >

            <span className="admin-nav-icon">
              {item.icon}
            </span>

            <span className="admin-nav-label">
              {item.label}
            </span>

          </NavLink>

        ))}

      </nav>

      {/* =========================================
          LOGGED-IN USER
      ========================================= */}

      <div
        className="admin-sidebar-user"
        style={{
          padding: "16px",
          borderTop:
            "1px solid rgba(255,255,255,0.08)",

          display: "flex",
          alignItems: "center",
          gap: 10,

          marginTop: "auto",
        }}
      >

        {/* AVATAR */}

        <Avatar
          size={38}
          style={{
            background: "#f0f5ff",
            color: "#1677ff",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {avatarLetter}
        </Avatar>

        {/* USER INFORMATION */}

        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.3,
          }}
        >

          <Text
            strong
            style={{
              color: "#ffffff",
              fontSize: 13,

              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",

              maxWidth: 170,
            }}
          >
            {userName}
          </Text>

          <Text
            style={{
              color:
                "rgba(255,255,255,0.55)",

              fontSize: 11,
            }}
          >
            {userRole}
          </Text>

        </div>

      </div>

    </aside>
  );
};

export default AdminSidebar;