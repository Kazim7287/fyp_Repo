import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =========================================================
// AUTH
// =========================================================

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";

// =========================================================
// ADMIN LAYOUT
// =========================================================

import AdminLayout from "./layouts/AdminLayout";

// =========================================================
// USER LAYOUT
// =========================================================

import UserLayout from "./layouts/UserLayout";

// =========================================================
// ADMIN PAGES
// =========================================================

import AdminDashboard from "./pages/Admin/AdminDashboard";
import LiveMonitoring from "./pages/Admin/LiveMonitoring";
import StationDetails from "./pages/Admin/StationDetails";
import AIForecasting from "./pages/Admin/AIForecasting";
import Alerts from "./pages/Admin/Alerts";
import FloodMap from "./pages/Admin/FloodMap";
import EnvironmentalData from "./pages/Admin/EnvironmentalData";
import IoTInfrastructure from "./pages/Admin/IoTInfrastructure";
import ReportsData from "./pages/Admin/ReportsData";
import Settings from "./pages/Admin/Settings";
import SystemLogs from "./pages/Admin/SystemLogs";
import Users from "./pages/Admin/Users";

// =========================================================
// ADMIN CONTENT MANAGEMENT
// =========================================================

import ContentManagement from "./pages/Admin/ContentManagement/ContentManagement";

import HomePage from "./pages/Admin/ContentManagement/HomePage";
import Blog from "./pages/Admin/ContentManagement/Blog";
import Research from "./pages/Admin/ContentManagement/Research";
import News from "./pages/Admin/ContentManagement/News";
import FloodAwareness from "./pages/Admin/ContentManagement/FloodAwareness";
import Announcements from "./pages/Admin/ContentManagement/Announcements";
import FAQs from "./pages/Admin/ContentManagement/FAQs";
import EmergencyInformation from "./pages/Admin/ContentManagement/EmergencyInformation";

// =========================================================
// ADMIN MEDIA LIBRARY
// =========================================================

import MediaLibrary from "./pages/Admin/MediaLibrary";

// =========================================================
// COMMON USER PAGES
// =========================================================

import UserDashboard from "./pages/User/UserDashboard";
import UserFloodMap from "./pages/User/FloodMap";
import UserForecast from "./pages/User/Forecast";
import UserCurrentConditions from "./pages/User/CurrentConditions";
import UserAlerts from "./pages/User/Alerts";
import UserHistoricalFloods from "./pages/User/HistoricalFloods";
import UserFloodSafety from "./pages/User/FloodSafety";
import UserEmergencyInfo from "./pages/User/EmergencyInfo";
import UserProfile from "./pages/User/Profile";
import UserSettings from "./pages/User/Settings";

// =========================================================
// APP
// =========================================================

const App = () => {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC AUTHENTICATION ROUTES
      ===================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =====================================================
          ADMIN PORTAL

          Authentication:
          - Must be logged in

          Authorization:
          - Must have role = admin
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute />
        }
      >

        <Route
          element={
            <RoleRoute
              allowedRoles={["admin"]}
            />
          }
        >

          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            {/* =================================================
                /admin
                → /admin/dashboard
            ================================================= */}

            <Route
              index
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />


            {/* =================================================
                DASHBOARD
                /admin/dashboard
            ================================================= */}

            <Route
              path="dashboard"
              element={<AdminDashboard />}
            />


            {/* =================================================
                LIVE MONITORING
                /admin/monitoring
            ================================================= */}

            <Route
              path="monitoring"
              element={<LiveMonitoring />}
            />


            {/* =================================================
                STATION DETAILS
                /admin/monitoring/:stationId
            ================================================= */}

            <Route
              path="monitoring/:stationId"
              element={<StationDetails />}
            />


            {/* =================================================
                AI FORECASTING
                /admin/ai
            ================================================= */}

            <Route
              path="ai"
              element={<AIForecasting />}
            />


            {/* =================================================
                ALERTS
                /admin/alerts
            ================================================= */}

            <Route
              path="alerts"
              element={<Alerts />}
            />


            {/* =================================================
                FLOOD MAP
                /admin/flood-map
            ================================================= */}

            <Route
              path="flood-map"
              element={<FloodMap />}
            />


            {/* =================================================
                ENVIRONMENTAL DATA
                /admin/environmental-data
            ================================================= */}

            <Route
              path="environmental-data"
              element={<EnvironmentalData />}
            />


            {/* =================================================
                IOT INFRASTRUCTURE
                /admin/iot
            ================================================= */}

            <Route
              path="iot"
              element={<IoTInfrastructure />}
            />


            {/* =================================================
                REPORTS
                /admin/reports
            ================================================= */}

            <Route
              path="reports"
              element={<ReportsData />}
            />


            {/* =================================================
                USERS
                /admin/users
            ================================================= */}

            <Route
              path="users"
              element={<Users />}
            />


            {/* =================================================
                SETTINGS
                /admin/settings
            ================================================= */}

            <Route
              path="settings"
              element={<Settings />}
            />


            {/* =================================================
                SYSTEM LOGS
                /admin/logs
            ================================================= */}

            <Route
              path="logs"
              element={<SystemLogs />}
            />


            {/* =================================================
                MEDIA LIBRARY
                /admin/media-library
            ================================================= */}

            <Route
              path="media-library"
              element={<MediaLibrary />}
            />


            {/* =================================================
                CONTENT MANAGEMENT
                /admin/content
            ================================================= */}

            <Route
              path="content"
              element={<ContentManagement />}
            >

              {/* /admin/content
                  → /admin/content/home
              */}

              <Route
                index
                element={
                  <Navigate
                    to="home"
                    replace
                  />
                }
              />

              <Route
                path="home"
                element={<HomePage />}
              />

              <Route
                path="blog"
                element={<Blog />}
              />

              <Route
                path="research"
                element={<Research />}
              />

              <Route
                path="news"
                element={<News />}
              />

              <Route
                path="flood-awareness"
                element={<FloodAwareness />}
              />

              <Route
                path="announcements"
                element={<Announcements />}
              />

              <Route
                path="faqs"
                element={<FAQs />}
              />

              <Route
                path="emergency-information"
                element={<EmergencyInformation />}
              />

            </Route>

          </Route>

        </Route>

      </Route>


      {/* =====================================================
          COMMON USER PORTAL

          Authentication:
          - Must be logged in

          Authorization:
          - Must have role = common_user
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute />
        }
      >

        <Route
          element={
            <RoleRoute
              allowedRoles={["common_user"]}
            />
          }
        >

          <Route
            path="/user"
            element={<UserLayout />}
          >

            {/* =================================================
                /user
                → /user/dashboard
            ================================================= */}

            <Route
              index
              element={
                <Navigate
                  to="/user/dashboard"
                  replace
                />
              }
            />


            {/* =================================================
                DASHBOARD
                /user/dashboard
            ================================================= */}

            <Route
              path="dashboard"
              element={<UserDashboard />}
            />


            {/* =================================================
                FLOOD MAP
                /user/flood-map
            ================================================= */}

            <Route
              path="flood-map"
              element={<UserFloodMap />}
            />


            {/* =================================================
                FORECAST
                /user/forecast
            ================================================= */}

            <Route
              path="forecast"
              element={<UserForecast />}
            />


            {/* =================================================
                CURRENT CONDITIONS
                /user/current-conditions
            ================================================= */}

            <Route
              path="current-conditions"
              element={<UserCurrentConditions />}
            />


            {/* =================================================
                ALERTS
                /user/alerts
            ================================================= */}

            <Route
              path="alerts"
              element={<UserAlerts />}
            />


            {/* =================================================
                HISTORICAL FLOODS
                /user/historical-floods
            ================================================= */}

            <Route
              path="historical-floods"
              element={<UserHistoricalFloods />}
            />


            {/* =================================================
                FLOOD SAFETY
                /user/flood-safety
            ================================================= */}

            <Route
              path="flood-safety"
              element={<UserFloodSafety />}
            />


            {/* =================================================
                EMERGENCY INFORMATION
                /user/emergency-info
            ================================================= */}

            <Route
              path="emergency-info"
              element={<UserEmergencyInfo />}
            />


            {/* =================================================
                PROFILE
                /user/profile
            ================================================= */}

            <Route
              path="profile"
              element={<UserProfile />}
            />


            {/* =================================================
                SETTINGS
                /user/settings
            ================================================= */}

            <Route
              path="settings"
              element={<UserSettings />}
            />

          </Route>

        </Route>

      </Route>


      {/* =====================================================
          UNKNOWN ROUTES
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
};

export default App;