import { Navigate } from "react-router-dom";
import { authManager } from "../utils/authManager";

interface ProtectedRouteProps {
  element: React.ReactElement;
}

export default function ProtectedRoute({ element }: ProtectedRouteProps) {
  if (!authManager.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return element;
}
