import { useEffect, useState } from "react";

import {
  Layout,
  Menu,
  Typography,
  Avatar,
  Dropdown,
  Button,
  Grid,
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

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const screens = Grid.useBreakpoint();

  const isMobile = !screens.lg;

  const [collapsed, setCollapsed] = useState(false);

  // =========================================================
  // REDUX AUTHENTICATION STATE
  // =========================================================

  const user = useAppSelector(
    (state) => state.auth.user
  );

  const dispatch = useAppDispatch();

  // =========================================================
  // USER INFORMATION
  // =========================================================

  const userName =
    user?.name || "User";

  const userRole =
    user?.role === "common_user"
      ? "Common User"
      : user?.role || "User";

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() || "U";

  // =========================================================
  // RESPONSIVE SIDEBAR
  // =========================================================

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isMobile]);

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleNavigation = (path) => {
    navigate(path);

    if (isMobile) {
      setCollapsed(true);
    }
  };

  // =========================================================
  // MENU ITEMS
  // =========================================================

  const menuItems = [
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

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {

      // Clear Redux authentication state
      dispatch(
        clearCredentials()
      );

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
        label: "Profile",
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
        handleNavigation(
          "/user/profile"
        );
      }

      if (key === "settings") {
        handleNavigation(
          "/user/settings"
        );
      }

      if (key === "logout") {
        handleLogout();
      }
    },
  };

  // =========================================================
  // CURRENT PAGE TITLE
  // =========================================================

  const getPageTitle = () => {

    const currentItem =
      menuItems.find(
        (item) =>
          item.key ===
          location.pathname
      );

    return (
      currentItem?.label ||
      "Dashboard"
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Layout
      style={{
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sider
        width={250}
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={
          isMobile ? 0 : 80
        }
        trigger={null}
        zeroWidthTriggerStyle={{
          display: "none",
        }}
        style={{
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          borderRight:
            "1px solid #f0f0f0",
          overflow: "auto",

          display: "flex",
          flexDirection: "column",
        }}
      >

        {/* =================================================
            LOGO
        ================================================= */}

        <div
          style={{
            height: 72,
            minHeight: 72,

            display: "flex",
            alignItems: "center",

            padding: collapsed
              ? "0 20px"
              : "0 22px",

            borderBottom:
              "1px solid #f0f0f0",

            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >

          {/* LOGO */}

          <div
            style={{
              flexShrink: 0,

              width: 40,
              height: 40,

              borderRadius: 10,

              background:
                "linear-gradient(135deg, #1677ff, #0958d9)",

              color: "#fff",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              fontWeight: 700,
              fontSize: 15,
            }}
          >
            FF
          </div>

          {/* BRAND TEXT */}

          {!collapsed && (
            <div
              style={{
                marginLeft: 12,
                overflow: "hidden",
              }}
            >

              <Text
                strong
                style={{
                  display: "block",
                  fontSize: 14,
                }}
              >
                Flood Forecasting
              </Text>

              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                }}
              >
                Public Portal
              </Text>

            </div>
          )}

        </div>

        {/* =================================================
            MENU
        ================================================= */}

        <Menu
          mode="inline"
          selectedKeys={[
            location.pathname,
          ]}
          items={menuItems}
          onClick={({ key }) =>
            handleNavigation(key)
          }
          style={{
            borderRight: 0,
            marginTop: 10,

            paddingBottom: 20,

            flex: 1,
          }}
        />

        {/* =================================================
            USER INFORMATION
        ================================================= */}

        <div
          style={{
            padding: collapsed
              ? "14px 20px"
              : "14px 18px",

            borderTop:
              "1px solid #f0f0f0",

            display: "flex",
            alignItems: "center",

            gap: 10,

            minHeight: 70,

            overflow: "hidden",
          }}
        >

          {/* USER AVATAR */}

          <Avatar
            size={38}
            style={{
              background: "#e6f4ff",
              color: "#1677ff",
              fontWeight: 600,

              flexShrink: 0,
            }}
          >
            {userInitial}
          </Avatar>

          {/* USER DETAILS */}

          {!collapsed && (
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
                  fontSize: 13,
                  color: "#262626",

                  overflow: "hidden",
                  textOverflow:
                    "ellipsis",
                  whiteSpace:
                    "nowrap",

                  maxWidth: 170,
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
          )}

        </div>

      </Sider>

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <Layout
        style={{
          marginLeft: isMobile
            ? 0
            : collapsed
              ? 80
              : 250,

          transition:
            "margin-left 0.2s",

          minWidth: 0,
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <Header
          style={{
            height: 64,
            lineHeight: "normal",

            background: "#fff",

            padding: isMobile
              ? "0 16px"
              : "0 24px",

            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",

            borderBottom:
              "1px solid #f0f0f0",

            position: "sticky",
            top: 0,

            zIndex: 900,
          }}
        >

          {/* LEFT SIDE */}

          <div
            style={{
              display: "flex",
              alignItems: "center",

              minWidth: 0,
            }}
          >

            {/* MOBILE MENU BUTTON */}

            {isMobile && (
              <Button
                type="text"
                icon={
                  <MenuOutlined />
                }
                onClick={() =>
                  setCollapsed(false)
                }
                style={{
                  width: 40,
                  height: 40,

                  marginRight: 8,

                  fontSize: 18,
                }}
              />
            )}

            {/* DESKTOP COLLAPSE BUTTON */}

            {!isMobile && (
              <Button
                type="text"
                onClick={() =>
                  setCollapsed(
                    !collapsed
                  )
                }
                style={{
                  marginRight: 10,
                  fontSize: 16,
                }}
              >
                ☰
              </Button>
            )}

            {/* PAGE TITLE */}

            <div
              style={{
                minWidth: 0,
              }}
            >

              <Text
                strong
                style={{
                  display: "block",

                  fontSize: isMobile
                    ? 14
                    : 16,

                  whiteSpace:
                    "nowrap",

                  overflow: "hidden",

                  textOverflow:
                    "ellipsis",

                  maxWidth: isMobile
                    ? 180
                    : 400,
                }}
              >
                {getPageTitle()}
              </Text>

              {!isMobile && (
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  Stay informed. Stay safe.
                </Text>
              )}

            </div>

          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <Dropdown
            menu={userMenu}
            trigger={["click"]}
            placement="bottomRight"
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",

                gap: 9,

                cursor: "pointer",

                padding: "4px 6px",

                borderRadius: 8,
              }}
            >

              {/* AVATAR */}

              <Avatar
                size={
                  isMobile ? 36 : 40
                }
                style={{
                  background:
                    "#1677ff",

                  color: "#fff",

                  flexShrink: 0,
                }}
              >
                {userInitial}
              </Avatar>

              {/* NAME + ROLE */}

              {!isMobile && (
                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",

                    lineHeight: 1.25,

                    minWidth: 0,
                  }}
                >

                  <Text
                    strong
                    style={{
                      fontSize: 13,

                      maxWidth: 150,

                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",

                      whiteSpace:
                        "nowrap",
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
              )}

            </div>

          </Dropdown>

        </Header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <Content
          style={{
            background: "#f5f7fa",

            padding: isMobile
              ? 12
              : 24,

            minHeight:
              "calc(100vh - 64px)",

            width: "100%",

            boxSizing: "border-box",

            overflowX: "hidden",
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: 1600,
              margin: "0 auto",
            }}
          >
            <Outlet />
          </div>

        </Content>

      </Layout>

      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ===================================================== */}

      {isMobile &&
        !collapsed && (
          <div
            onClick={() =>
              setCollapsed(true)
            }
            style={{
              position: "fixed",
              inset: 0,

              background:
                "rgba(0, 0, 0, 0.35)",

              zIndex: 999,
            }}
          />
        )}

    </Layout>
  );
};

export default UserLayout;