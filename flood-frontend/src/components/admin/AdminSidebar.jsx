
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

import { Avatar, Typography, Tooltip } from "antd";

import { useAppSelector } from "../../hooks/redux";

import "./styles/AdminSidebar.css";

const { Text } = Typography;

// =========================================================
// ADMIN NAVIGATION ITEMS
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
// ADMIN SIDEBAR
// =========================================================

const AdminSidebar = ({ collapsed = false }) => {
  const user = useAppSelector((state) => state.auth.user);

  // User information
  const userName = user?.name || "Administrator";

  const userRole =
    user?.role === "admin" ? "System Admin" : "User";

  const avatarLetter =
    user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <aside
      className={`admin-sidebar ${
        collapsed ? "admin-sidebar-collapsed" : ""
      }`}
    >
      {/* BRAND HEADER */}
      <div className="admin-sidebar-header">
        <div className="admin-brand">
          <div className="admin-brand-logo">
            <RadarChartOutlined />
          </div>

          {!collapsed && (
            <div className="admin-brand-information">
              <h2>FloodGuard</h2>
              <span>FLOOD MONITORING SYSTEM</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="admin-portal-badge">
            ADMIN PORTAL
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <div className="admin-sidebar-section">
        {!collapsed && (
          <span className="admin-sidebar-section-title">
            MAIN MENU
          </span>
        )}

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => (
            <Tooltip
              key={item.path}
              title={collapsed ? item.label : ""}
              placement="right"
            >
              <NavLink
                to={item.path}
                end={item.path === "/admin/dashboard"}
                className={({ isActive }) =>
                  `admin-nav-item ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <span className="admin-nav-icon">
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="admin-nav-label">
                    {item.label}
                  </span>
                )}

                {!collapsed &&
                  item.path === "/admin/alerts" && (
                    <span className="admin-nav-indicator">
                      !
                    </span>
                  )}
              </NavLink>
            </Tooltip>
          ))}
        </nav>
      </div>

      {/* USER PROFILE */}
      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">
          <Avatar
            size={40}
            className="admin-user-avatar"
          >
            {avatarLetter}
          </Avatar>

          {!collapsed && (
            <div className="admin-user-information">
              <Text className="admin-user-name">
                {userName}
              </Text>

              <Text className="admin-user-role">
                {userRole}
              </Text>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="admin-sidebar-version">
            FloodGuard Admin
            <span>Monitoring & Management</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
