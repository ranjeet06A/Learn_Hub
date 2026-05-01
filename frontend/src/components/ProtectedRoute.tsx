import { Navigate } from "react-router-dom";
import { authManager } from "../utils/authManager";

interface ProtectedRouteProps {
  element: React.ReactElement;
}

export default function ProtectedRoute({ element }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!authManager.isAuthenticated()) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return element;
}