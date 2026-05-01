import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(
    localStorage.getItem("learn_hub_user") || "{}"
  );

  const handleLogout = () => {
    // ✅ FIX: clear EVERYTHING
    localStorage.removeItem("token");
    localStorage.removeItem("learn_hub_user");

    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname === path;

  return (
    <div style={container}>
      {/* LEFT MENU */}
      <div style={menu}>
        <span
          onClick={() => navigate("/")}
          style={isActive("/") ? activeItem : navItem}
        >
          Dashboard
        </span>

        <span
          onClick={() => navigate("/courses")}
          style={isActive("/courses") ? activeItem : navItem}
        >
          Courses
        </span>

        <span
          onClick={() => navigate("/progress")}
          style={isActive("/progress") ? activeItem : navItem}
        >
          My Progress
        </span>

        {/* ✅ ADMIN CONTROL */}
        {user?.role === "admin" && (
          <span
            onClick={() => navigate("/admin")}
            style={isActive("/admin") ? activeItem : navItem}
          >
            Admin
          </span>
        )}

        <span
          onClick={() => navigate("/results")}
          style={isActive("/results") ? activeItem : navItem}
        >
          📊 Results
        </span>
      </div>

      {/* RIGHT */}
      <div>
        <button onClick={handleLogout} style={logoutBtn}>
          Logout
        </button>
      </div>
    </div>
  );
}

// =========================
// STYLES
// =========================
const container = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 20px",
  background: "#667eea",
  color: "white",
  fontWeight: "bold",
};

const menu = {
  display: "flex",
  gap: "15px",
};

const navItem = {
  cursor: "pointer",
  opacity: 0.8,
};

const activeItem = {
  cursor: "pointer",
  borderBottom: "2px solid white",
};

const logoutBtn = {
  background: "#ff4d4d",
  border: "none",
  padding: "6px 12px",
  color: "white",
  borderRadius: "5px",
  cursor: "pointer",
};