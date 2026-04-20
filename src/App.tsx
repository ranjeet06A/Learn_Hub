import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LessonView from "./pages/LessonView";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Progress from "./pages/Progress";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { authManager } from "./utils/authManager";
import type { User } from "./utils/authManager";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const currentUser = authManager.getCurrentUser();
    setUser(currentUser);
  }, [location]);

  if (!user) return null;

  const handleLogout = () => {
    authManager.logout();
    navigate("/login");
  };

  return (
    <nav style={{ padding: "15px 30px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", gap: "20px", alignItems: "center" }}>
      <Link to="/" style={{ marginRight: "auto", textDecoration: "none", color: "white", fontWeight: "600", fontSize: "18px" }}>
        Learn Hub 🎓
      </Link>
      <Link to="/" style={{ textDecoration: "none", color: "white", fontWeight: "500" }}>
        Dashboard
      </Link>
      <Link to="/courses" style={{ textDecoration: "none", color: "white", fontWeight: "500" }}>
        Courses
      </Link>
      <Link to="/progress" style={{ textDecoration: "none", color: "white", fontWeight: "500" }}>
        📊 My Progress
      </Link>
      <Link to="/admin" style={{ textDecoration: "none", color: "white", fontWeight: "500", borderLeft: "2px solid white", paddingLeft: "20px" }}>
        ⚙️ Admin
      </Link>

      {/* User Profile */}
      <div style={{ position: "relative", borderLeft: "2px solid white", paddingLeft: "20px" }}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          👤 {user.username}
        </button>

        {showUserMenu && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              minWidth: "200px",
              zIndex: 1000,
              marginTop: "10px",
            }}
          >
            <div style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
              <p style={{ margin: "0 0 5px 0", fontWeight: "600", color: "#333" }}>{user.username}</p>
              <p style={{ margin: 0, color: "#999", fontSize: "13px" }}>{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "12px 15px",
                background: "none",
                border: "none",
                color: "#FF6B6B",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                textAlign: "left",
              }}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  const location = useLocation();
  const showNavbar = !["/login", "/register"].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/courses" element={<ProtectedRoute element={<Courses />} />} />
        <Route path="/course/:id" element={<ProtectedRoute element={<CourseDetail />} />} />
        <Route path="/course/:id/lesson/:lessonId" element={<ProtectedRoute element={<LessonView />} />} />
        <Route path="/progress" element={<ProtectedRoute element={<Progress />} />} />
        <Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} />} />
      </Routes>
    </>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

