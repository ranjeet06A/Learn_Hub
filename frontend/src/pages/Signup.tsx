import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// ❌ remove this (not needed anymore)
// import { signup } from "../utils/auth";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.text();

      if (!res.ok) {
        throw new Error(data);
      }

      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Signup</h2>

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", marginBottom: 10 }}
        />

        <button type="submit">Sign Up</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        Already have account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}