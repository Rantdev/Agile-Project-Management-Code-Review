import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../Common/LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token");

  console.log("ProtectedRoute - User:", user);
  console.log("ProtectedRoute - Loading:", loading);
  console.log("ProtectedRoute - Token:", token ? "Present" : "Missing");

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user && !token) {
    console.log("ProtectedRoute - No user, redirecting to login");
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;