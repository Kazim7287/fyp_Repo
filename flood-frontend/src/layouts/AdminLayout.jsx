
import { useEffect, useMemo, useState } from "react";

import {
  Layout,
  Menu,
  Drawer,
  Button,
  Grid,
} from "antd";

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
  MenuOutlined,
} from "@ant-design/icons";

import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AdminHeader from "../components/admin/AdminHeader";

import "./styles/AdminLayout.css";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const MENU_ITEMS = [
  {
    key: "/admin/dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/admin/monitoring",
    icon: <RadarChartOutlined />,
    label: "Live Monitoring",
  },
  {
    key: "/admin/flood-map",
    icon: <EnvironmentOutlined />,
    label: "Flood Map",
  },
  {
    key: "/admin/ai",
    icon: <RobotOutlined />,
    label: "AI & Forecasting",
  },
  {
    key: "/admin/environmental-data",
    icon: <CloudOutlined />,
    label: "Environmental Data",
  },
  {
    key: "/admin/iot",
    icon: <ApiOutlined />,
    label: "IoT Infrastructure",
  },
  {
    key: "/admin/alerts",
    icon: <AlertOutlined />,
    label: "Alerts",
  },
  {
    key: "/admin/reports",
    icon: <BarChartOutlined />,
    label: "Reports & Data",
  },
  {
    key: "/admin/content",
    icon: <EditOutlined />,
    label: "Content Management",
  },
  {
    key: "/admin/media-library",
    icon: <PictureOutlined />,
    label: "Media Library",
  },
  {
    key: "/admin/users",
    icon: <UserOutlined />,
    label: "Users",
  },
  {
    key: "/admin/settings",
    icon: <SettingOutlined />,
    label: "Settings",
  },
  {
    key: "/admin/logs",
    icon: <FileTextOutlined />,
    label: "System Logs",
  },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobile = !screens.md;
  const isTablet = Boolean(screens.md && !screens.lg);

  // Keep the sidebar collapsed on tablet screens.
  useEffect(() => {
    if (isMobile) {
      setCollapsed(false);
      setMobileMenuOpen(false);
      return;
    }

    if (isTablet) {
      setCollapsed(true);
      return;
    }

    if (screens.lg) {
      setCollapsed(false);
    }
  }, [isMobile, isTablet, screens.lg]);

  // Select the closest matching parent route.
  const selectedMenuKey = useMemo(() => {
    const matchingItem = MENU_ITEMS
      .filter((item) =>
        location.pathname === item.key ||
        location.pathname.startsWith(`${item.key}/`)
      )
      .sort((a, b) => b.key.length - a.key.length)[0];

    return matchingItem?.key || "/admin/dashboard";
  }, [location.pathname]);

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setMobileMenuOpen(false);
  };

  const renderSidebar = (drawer = false) => {
    const sidebarCollapsed = drawer ? false : collapsed;

    return (
      <div className="admin-sidebar-inner">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-mark">FF</div>

          {!sidebarCollapsed && (
            <div className="admin-brand-text">
              <span className="admin-brand-title">
                Flood Forecasting
              </span>
              <span className="admin-brand-subtitle">
                Monitoring System
              </span>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="admin-sidebar-section-label">
            ADMIN PORTAL
          </div>
        )}

        <div className="admin-sidebar-menu">
          <Menu
            theme="dark"
            mode="inline"
            inlineCollapsed={sidebarCollapsed}
            selectedKeys={[selectedMenuKey]}
            items={MENU_ITEMS}
            onClick={handleMenuClick}
          />
        </div>

        {!drawer && (
          <div className="admin-sidebar-footer">
            <Button
              type="text"
              className="admin-sidebar-collapse-button"
              onClick={() => setCollapsed((previous) => !previous)}
              aria-label={
                collapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              title={
                collapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              <span className="admin-collapse-symbol">
                {collapsed ? "›" : "‹"}
              </span>
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout className="admin-app-layout">
      {/* Desktop and tablet sidebar */}
      {!isMobile && (
        <Sider
          className="admin-desktop-sider"
          width={260}
          collapsedWidth={80}
          collapsed={collapsed}
          trigger={null}
        >
          {renderSidebar(false)}
        </Sider>
      )}

      {/* Mobile navigation drawer */}
      <Drawer
        placement="left"
        open={isMobile && mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        width={280}
        closable={false}
        destroyOnClose={false}
        className="admin-mobile-drawer"
        styles={{
          body: {
            padding: 0,
            background: "#001529",
          },
          content: {
            background: "#001529",
          },
        }}
      >
        {renderSidebar(true)}
      </Drawer>

      {/* Main application area */}
      <Layout className="admin-main-layout">
        {/* Header row */}
        <div className="admin-header-shell">
          {isMobile && (
            <Button
              type="text"
              className="admin-mobile-menu-button"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            />
          )}

          <div className="admin-header-content">
            <AdminHeader />
          </div>
        </div>

        {/* Page content */}
        <Content className="admin-content-scroll">
          <div className="admin-page-container">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
