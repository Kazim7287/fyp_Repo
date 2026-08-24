import { useEffect, useState } from "react";

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

// IMPORTANT
import AdminHeader from "../components/admin/AdminHeader";

const { Layout: AntLayout, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* =========================================================
     RESPONSIVE STATES
  ========================================================= */

  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  /* =========================================================
     RESPONSIVE SIDEBAR
  ========================================================= */

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

    if (isDesktop) {
      setCollapsed(false);
    }
  }, [isMobile, isTablet, isDesktop]);

  /* =========================================================
     MENU ITEMS
  ========================================================= */

  const menuItems = [
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

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleMenuClick = ({ key }) => {
    navigate(key);

    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  /* =========================================================
     SIDEBAR CONTENT
  ========================================================= */

  const renderSidebar = (isDrawer = false) => {
    const sidebarCollapsed = isDrawer
      ? false
      : collapsed;

    return (
      <div
        style={{
          height: "100%",
          width: "100%",

          display: "flex",
          flexDirection: "column",

          background: "#001529",

          overflow: "hidden",
        }}
      >
        {/* =================================================
            LOGO
        ================================================= */}

        <div
          style={{
            height: 64,
            minHeight: 64,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            padding: sidebarCollapsed
              ? "0 10px"
              : "0 20px",

            color: "#ffffff",

            fontSize: sidebarCollapsed
              ? 18
              : 19,

            fontWeight: 700,

            whiteSpace: "nowrap",

            letterSpacing: 0.2,

            flexShrink: 0,

            borderBottom:
              "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {sidebarCollapsed
            ? "FF"
            : "Flood Forecasting"}
        </div>

        {/* =================================================
            ADMIN PORTAL
        ================================================= */}

        {!sidebarCollapsed && (
          <div
            style={{
              padding: "14px 20px 8px",

              color: "#8c8c8c",

              fontSize: 10,

              letterSpacing: 1.4,

              fontWeight: 500,

              flexShrink: 0,
            }}
          >
            ADMIN PORTAL
          </div>
        )}

        {/* =================================================
            MENU
        ================================================= */}

        <div
          className="admin-sidebar-scroll"
          style={{
            flex: 1,

            minHeight: 0,

            overflowY: "auto",

            overflowX: "hidden",

            WebkitOverflowScrolling:
              "touch",
          }}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[
              location.pathname,
            ]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              borderRight: 0,

              padding: sidebarCollapsed
                ? "0 6px"
                : "0 10px",
            }}
          />
        </div>
      </div>
    );
  };

  /* =========================================================
     SIDEBAR WIDTH
  ========================================================= */

  const sidebarWidth = collapsed
    ? 80
    : 260;

  /* =========================================================
     MAIN LAYOUT
  ========================================================= */

  const mainMarginLeft = isMobile
    ? 0
    : sidebarWidth;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          GLOBAL CSS
      ===================================================== */}

      <style>
        {`
          /* ================================
             SIDEBAR SCROLLBAR
          ================================= */

          .admin-sidebar-scroll::-webkit-scrollbar {
            width: 0;
            height: 0;
          }

          .admin-sidebar-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }


          /* ================================
             MAIN CONTENT SCROLLBAR
          ================================= */

          .admin-content-scroll::-webkit-scrollbar {
            width: 0;
            height: 0;
          }

          .admin-content-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }


          /* ================================
             GLOBAL
          ================================= */

          html,
          body,
          #root {
            width: 100%;
            min-width: 0;
            margin: 0;
            padding: 0;
          }

          body {
            overflow-x: hidden;
          }


          /* ================================
             SIDEBAR MENU
          ================================= */

          .admin-sidebar-scroll .ant-menu {
            background: transparent !important;
          }

          .admin-sidebar-scroll
          .ant-menu-item,
          .admin-sidebar-scroll
          .ant-menu-submenu-title {
            margin: 4px 0 !important;
            border-radius: 7px;
          }

          .admin-sidebar-scroll
          .ant-menu-item-selected {
            font-weight: 500;
          }


          /* ================================
             MENU TRANSITIONS
          ================================= */

          .admin-sidebar-scroll
          .ant-menu-item,
          .admin-sidebar-scroll
          .ant-menu-submenu-title {
            transition:
              background-color 0.2s ease,
              color 0.2s ease;
          }


          /* ================================
             MOBILE DRAWER
          ================================= */

          .admin-mobile-drawer
          .ant-drawer-body {
            padding: 0 !important;
          }

          .admin-mobile-drawer
          .ant-drawer-content {
            background: #001529 !important;
          }


          /* ================================
             TABLE RESPONSIVENESS
          ================================= */

          .ant-table-wrapper {
            max-width: 100%;
            overflow-x: auto;
          }


          /* ================================
             MOBILE CARDS
          ================================= */

          @media (max-width: 576px) {

            .ant-card {
              border-radius: 10px !important;
            }

            .ant-card-body {
              padding: 16px !important;
            }

          }
        `}
      </style>

      <Layout
        style={{
          width: "100%",
          height: "100dvh",
          minHeight: "100dvh",

          overflow: "hidden",

          background: "#f5f7fa",
        }}
      >

        {/* ===================================================
            DESKTOP / TABLET SIDEBAR
        =================================================== */}

        {!isMobile && (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}

            width={260}
            collapsedWidth={80}

            theme="dark"

            trigger={null}

            style={{
              position: "fixed",

              left: 0,
              top: 0,
              bottom: 0,

              width: collapsed
                ? 80
                : 260,

              height: "100dvh",

              zIndex: 1100,

              overflow: "hidden",

              background: "#001529",

              boxShadow:
                "1px 0 0 rgba(255,255,255,0.06)",

              transition:
                "width 0.2s ease",
            }}
          >
            {renderSidebar(false)}

            {/* =================================================
                SIDEBAR COLLAPSE BUTTON
            ================================================= */}

            <Button
              type="text"
              onClick={() =>
                setCollapsed(!collapsed)
              }
              style={{
                position: "absolute",

                bottom: 14,
                right: 18,

                width: 44,
                height: 36,

                color: "#ffffff",

                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",

                background:
                  "rgba(255,255,255,0.06)",

                borderRadius: 6,

                zIndex: 1200,
              }}
            >
              {collapsed ? "›" : "‹"}
            </Button>
          </Sider>
        )}

        {/* ===================================================
            MOBILE DRAWER
        =================================================== */}

        {isMobile && (
          <Drawer
            placement="left"

            open={mobileMenuOpen}

            onClose={() =>
              setMobileMenuOpen(false)
            }

            width={280}

            closable={false}

            className="admin-mobile-drawer"

            styles={{
              body: {
                padding: 0,
                background: "#001529",
              },

              content: {
                padding: 0,
                background: "#001529",
              },

              wrapper: {
                zIndex: 2000,
              },
            }}
          >
            {renderSidebar(true)}
          </Drawer>
        )}

        {/* ===================================================
            MAIN APPLICATION
        =================================================== */}

        <Layout
          style={{
            marginLeft:
              mainMarginLeft,

            width: isMobile
              ? "100%"
              : `calc(100% - ${sidebarWidth}px)`,

            height: "100dvh",

            minWidth: 0,

            background: "#f5f7fa",

            transition:
              "margin-left 0.2s ease, width 0.2s ease",
          }}
        >

          {/* =================================================
              ADMIN HEADER COMPONENT
              
              IMPORTANT:
              The old inline Header has been removed.
          ================================================= */}

          <AdminHeader />

          {/* =================================================
              MOBILE MENU BUTTON
              
              Since AdminHeader is now separate,
              we put the mobile menu trigger above
              the content as a floating button.
          ================================================= */}

          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() =>
                setMobileMenuOpen(true)
              }
              style={{
                position: "fixed",

                top: 12,
                left: 12,

                width: 40,
                height: 40,

                zIndex: 2100,

                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",

                fontSize: 18,

                background: "#ffffff",

                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.08)",

                borderRadius: 8,
              }}
            />
          )}

          {/* =================================================
              CONTENT
          ================================================= */}

          <Content
            className="admin-content-scroll"
            style={{
              padding: isMobile
                ? "16px 14px 24px"
                : isTablet
                ? "20px 20px 28px"
                : "26px 28px 32px",

              background: "#f5f7fa",

              height:
                "calc(100dvh - 64px)",

              overflowY: "auto",

              overflowX: "hidden",

              flex: 1,

              minHeight: 0,
              minWidth: 0,

              WebkitOverflowScrolling:
                "touch",

              scrollBehavior:
                "smooth",

              boxSizing:
                "border-box",
            }}
          >
            <Outlet />
          </Content>

        </Layout>
      </Layout>
    </>
  );
};

export default AdminLayout;