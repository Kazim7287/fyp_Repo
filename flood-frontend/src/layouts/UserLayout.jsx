
import { useEffect, useMemo, useState } from "react";

import {
  Layout,
  Menu,
  Typography,
  Avatar,
  Dropdown,
  Button,
  Grid,
  Drawer,
} from "antd";

import {
  DashboardOutlined,
  EnvironmentOutlined,
  LineChartOutlined,
  CloudOutlined,
  BellOutlined,
  HistoryOutlined,
  SafetyOutlined,
  AlertOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { logout } from "../api/auth.api";

import {
  useAppSelector,
  useAppDispatch,
} from "../hooks/redux";

import {
  clearCredentials,
} from "../store/slices/authSlice";

import "./styles/UserLayout.css";

const { Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const USER_MENU_ITEMS = [
  {
    key: "/user/dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/user/flood-map",
    icon: <EnvironmentOutlined />,
    label: "Flood Map",
  },
  {
    key: "/user/forecast",
    icon: <LineChartOutlined />,
    label: "Forecast",
  },
  {
    key: "/user/current-conditions",
    icon: <CloudOutlined />,
    label: "Current Conditions",
  },
  {
    key: "/user/alerts",
    icon: <BellOutlined />,
    label: "Alerts",
  },
  {
    key: "/user/historical-floods",
    icon: <HistoryOutlined />,
    label: "Historical Floods",
  },
  {
    key: "/user/flood-safety",
    icon: <SafetyOutlined />,
    label: "Flood Safety",
  },
  {
    key: "/user/emergency-info",
    icon: <AlertOutlined />,
    label: "Emergency Info",
  },
  {
    key: "/user/profile",
    icon: <UserOutlined />,
    label: "Profile",
  },
  {
    key: "/user/settings",
    icon: <SettingOutlined />,
    label: "Settings",
  },
];

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const isMobile = !screens.md;
  const isTablet = Boolean(screens.md && !screens.lg);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  // =========================================================
  // USER INFORMATION
  // =========================================================

  const userName = user?.name || "User";

  const userRole =
    user?.role === "common_user"
      ? "Common User"
      : user?.role || "User";

  const userInitial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  // =========================================================
  // RESPONSIVE SIDEBAR
  // =========================================================

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

  // =========================================================
  // ACTIVE MENU ITEM
  // =========================================================

  const selectedMenuKey = useMemo(() => {
    const matchedItem = USER_MENU_ITEMS
      .filter(
        (item) =>
          location.pathname === item.key ||
          location.pathname.startsWith(`${item.key}/`)
      )
      .sort((a, b) => b.key.length - a.key.length)[0];

    return matchedItem?.key || "/user/dashboard";
  }, [location.pathname]);

  const currentPageTitle = useMemo(() => {
    const matchedItem = USER_MENU_ITEMS
      .filter(
        (item) =>
          location.pathname === item.key ||
          location.pathname.startsWith(`${item.key}/`)
      )
      .sort((a, b) => b.key.length - a.key.length)[0];

    return matchedItem?.label || "Dashboard";
  }, [location.pathname]);

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(clearCredentials());

      navigate("/login", {
        replace: true,
      });
    }
  };

  // =========================================================
  // USER DROPDOWN
  // =========================================================

  const userMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "My Profile",
      },
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: "Settings",
      },
      {
        type: "divider",
      },
      {
        key: "logout",
        danger: true,
        icon: <LogoutOutlined />,
        label: "Logout",
      },
    ],

    onClick: ({ key }) => {
      if (key === "profile") {
        handleNavigation("/user/profile");
      }

      if (key === "settings") {
        handleNavigation("/user/settings");
      }

      if (key === "logout") {
        handleLogout();
      }
    },
  };

  // =========================================================
  // SIDEBAR CONTENT
  // =========================================================

  const renderSidebar = (drawer = false) => {
    const sidebarCollapsed = drawer ? false : collapsed;

    return (
      <div className="user-sidebar-inner">

        {/* BRAND */}
        <div className="user-sidebar-brand">
          <div className="user-brand-mark">
            FF
          </div>

          {!sidebarCollapsed && (
            <div className="user-brand-text">
              <Text className="user-brand-title">
                Flood Forecasting
              </Text>

              <Text className="user-brand-subtitle">
                Public Portal
              </Text>
            </div>
          )}
        </div>

        {/* SECTION LABEL */}
        {!sidebarCollapsed && (
          <div className="user-sidebar-section-label">
            MAIN MENU
          </div>
        )}

        {/* NAVIGATION */}
        <div className="user-sidebar-menu">
          <Menu
            mode="inline"
            theme="light"
            selectedKeys={[selectedMenuKey]}
            items={USER_MENU_ITEMS}
            onClick={({ key }) => handleNavigation(key)}
            inlineCollapsed={sidebarCollapsed}
          />
        </div>

        {/* USER INFORMATION */}
        <div className="user-sidebar-profile">
          <Avatar
            size={40}
            className="user-sidebar-avatar"
          >
            {userInitial}
          </Avatar>

          {!sidebarCollapsed && (
            <div className="user-sidebar-user-details">
              <Text
                strong
                className="user-sidebar-user-name"
                title={userName}
              >
                {userName}
              </Text>

              <Text className="user-sidebar-user-role">
                {userRole}
              </Text>
            </div>
          )}
        </div>

        {/* COLLAPSE CONTROL */}
        {!drawer && (
          <div className="user-sidebar-footer">
            <Button
              type="text"
              className="user-sidebar-collapse-button"
              icon={
                collapsed
                  ? <MenuUnfoldOutlined />
                  : <MenuFoldOutlined />
              }
              onClick={() => {
                setCollapsed((previous) => !previous);
              }}
              title={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              aria-label={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            />
          </div>
        )}
      </div>
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Layout className="user-app-layout">

      {/* =====================================================
          DESKTOP / TABLET SIDEBAR
      ===================================================== */}

      {!isMobile && (
        <Sider
          className="user-desktop-sider"
          width={250}
          collapsedWidth={80}
          collapsed={collapsed}
          trigger={null}
        >
          {renderSidebar(false)}
        </Sider>
      )}

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      <Drawer
        placement="left"
        open={isMobile && mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        width={280}
        closable={false}
        destroyOnClose={false}
        className="user-mobile-drawer"
        styles={{
          body: {
            padding: 0,
            overflow: "hidden",
          },
          content: {
            background: "#ffffff",
          },
        }}
        title={null}
      >
        <div className="user-mobile-drawer-header">
          <span className="user-mobile-drawer-title">
            Navigation
          </span>

          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          />
        </div>

        {renderSidebar(true)}
      </Drawer>

      {/* =====================================================
          MAIN APPLICATION
      ===================================================== */}

      <Layout className="user-main-layout">

        {/* HEADER */}
        <div className="user-header">

          {/* LEFT SIDE */}
          <div className="user-header-left">

            {isMobile ? (
              <Button
                type="text"
                className="user-mobile-menu-button"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation"
              />
            ) : (
              <Button
                type="text"
                className="user-desktop-menu-button"
                icon={
                  collapsed
                    ? <MenuUnfoldOutlined />
                    : <MenuFoldOutlined />
                }
                onClick={() => {
                  setCollapsed((previous) => !previous);
                }}
                aria-label="Toggle sidebar"
              />
            )}

            <div className="user-header-page-info">
              <Text className="user-header-page-title">
                {currentPageTitle}
              </Text>

              {!isMobile && (
                <Text className="user-header-page-subtitle">
                  Stay informed. Stay safe.
                </Text>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="user-header-right">

            <Dropdown
              menu={userMenu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button
                type="button"
                className="user-header-profile"
                aria-label="Open user menu"
              >
                <Avatar
                  size={38}
                  className="user-header-avatar"
                >
                  {userInitial}
                </Avatar>

                {!isMobile && (
                  <div className="user-header-user-details">
                    <Text className="user-header-user-name">
                      {userName}
                    </Text>

                    <Text className="user-header-user-role">
                      {userRole}
                    </Text>
                  </div>
                )}
              </button>
            </Dropdown>

          </div>
        </div>

        {/* PAGE CONTENT */}
        <Content className="user-content-scroll">
          <div className="user-page-container">
            <Outlet />
          </div>
        </Content>

      </Layout>
    </Layout>
  );
};

export default UserLayout;
