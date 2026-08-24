import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Temporary protection.
  // We will replace this with a real /me API check next.

  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;