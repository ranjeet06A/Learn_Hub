import { Navigate } from "react-router-dom";
import { authManager } from "../utils/authManager";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

  // ❌ No token → redirect
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Token invalid (extra safety)
  if (!authManager.isAuthenticated()) {
    localStorage.removeItem("token");
    localStorage.removeItem("learn_hub_user");
    return <Navigate to="/login" replace />;
  }

  // ✅ Authorized → render page
  return children;
}