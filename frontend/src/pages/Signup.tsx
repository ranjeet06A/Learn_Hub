import api from "../utils/api";
import { useState } from "react";
import {
  useNavigate,
  Link,
} from "react-router-dom";

export default function Signup() {
  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSignup = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    // =========================
    // CLEAN EMAIL
    // =========================

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    // =========================
    // EMAIL VALIDATION
    // =========================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        cleanEmail
      )
    ) {
      setError(
        "Please enter a valid email address"
      );

      return;
    }

    // =========================
    // PASSWORD VALIDATION
    // =========================

    if (
      password.trim()
        .length < 6
    ) {
      setError(
        "Password must be at least 6 characters"
      );

      return;
    }

    try {
      // =========================
      // REGISTER USER
      // =========================

      const data =
        await api.post(
          "/register",
          {
            email:
              cleanEmail,

            password:
              password.trim(),
          }
        );

      if (!data) {
        throw new Error(
          "Signup failed"
        );
      }

      alert(
        "Signup successful! Please login."
      );

      navigate("/login");
    } catch (err: any) {
      setError(
        err.message ||
          "Signup failed"
      );
    }
  };

  return (
    <div
      style={{
        padding: 40,
      }}
    >
      <h2>Signup</h2>

      <form
        onSubmit={
          handleSignup
        }
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={{
            display:
              "block",
            marginBottom: 10,
            padding: 10,
            width: 300,
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          style={{
            display:
              "block",
            marginBottom: 10,
            padding: 10,
            width: 300,
          }}
        />

        <button
          type="submit"
          style={{
            padding:
              "10px 20px",
            cursor:
              "pointer",
          }}
        >
          Sign Up
        </button>
      </form>

      {error && (
        <p
          style={{
            color: "red",
            marginTop: 10,
          }}
        >
          {error}
        </p>
      )}

      <p
        style={{
          marginTop: 20,
        }}
      >
        Already have
        account?{" "}
        <Link to="/login">
          Login
        </Link>
      </p>
    </div>
  );
}