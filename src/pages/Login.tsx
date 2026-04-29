import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ FIXED: STORE CORRECT USER DATA
      localStorage.setItem(
        "learn_hub_user",
        JSON.stringify({
          email: email.trim().toLowerCase(), // ✅ IMPORTANT FIX
          role: data.role,
        })
      );

      // ✅ OPTIONAL BUT GOOD (for future auth)
      localStorage.setItem("token", data.token);

      // 🔥 trigger UI update instantly
      window.dispatchEvent(new Event("storage"));

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: "32px", marginBottom: 10 }}>
            🎓 Learn Hub
          </h1>
          <p style={{ color: "#777" }}>Welcome back</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              disabled={loading}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              style={inputStyle}
            />
          </div>

          {error && <div style={errorBox}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle(loading)}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20 }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>

        <p style={{ textAlign: "center" }}>
          <Link to="/forgot">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
}

// ================= STYLES =================

const container = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
};

const card = {
  background: "white",
  padding: "50px",
  borderRadius: "12px",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
  maxWidth: "400px",
  width: "100%",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  border: "1px solid #ccc",
  borderRadius: "6px",
};

const errorBox = {
  background: "#ffe6e6",
  color: "#cc0000",
  padding: 10,
  borderRadius: 6,
  marginBottom: 15,
  textAlign: "center" as const,
};

const buttonStyle = (loading: boolean) => ({
  width: "100%",
  padding: "12px",
  background: loading ? "#999" : "#667eea",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: loading ? "not-allowed" : "pointer",
});