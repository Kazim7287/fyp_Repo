import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import ProtectedRoute
  from "./ProtectedRoute";

import RoleRoute
  from "./RoleRoute";

import Login
  from "../pages/auth/Login";

import Register
  from "../pages/auth/Register";

import Dashboard
  from "../pages/dashboard/Dashboard";

import Users
  from "../pages/users/Users";

import Sensors
  from "../pages/sensors/Sensors";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Authenticated */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/sensors"
            element={<Sensors />}
          />


          {/* Admin Only */}

          <Route element={
            <RoleRoute
              allowedRoles={["admin"]}
            />
          }>
            <Route
              path="/users"
              element={<Users />}
            />
          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;