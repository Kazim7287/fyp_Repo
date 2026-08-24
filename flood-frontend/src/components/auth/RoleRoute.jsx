import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";

const RoleRoute = ({ allowedRoles = [] }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAppSelector(
    (state) => state.auth
  );

  console.log("RoleRoute:", {
    user,
    isAuthenticated,
    isLoading,
    allowedRoles,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return <Outlet />;
};

export default RoleRoute;