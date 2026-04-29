import { Navigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";

export default function AdminRoute({ children }: any) {
  if (!isAdmin()) {
    return <Navigate to="/login" />;
  }
  return children;
}