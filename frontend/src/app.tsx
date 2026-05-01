import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Dashboard from "./pages/Dashboard";
import SelectExam from "./pages/SelectExam";
import Signup from "./pages/Signup";
import Courses from "./pages/Courses";
import CourseView from "./pages/CourseView";
import LessonView from "./pages/LessonView";
import Results from "./pages/Results";
import Progress from "./pages/Progress";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";

import ProtectedRoute from "./components/ProtectedRoute"; // ✅ NEW

export default function App() {
  const [isAuth, setIsAuth] = useState(false);

  // ✅ FIX: use token instead of learn_hub_user
  useEffect(() => {
    const checkAuth = () => {
      setIsAuth(!!localStorage.getItem("token"));
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <BrowserRouter>
      {/* ✅ Navbar controlled by token */}
      {isAuth && <Navbar />}

      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* PROTECTED */}
        <Route
          path="/"
          element={<ProtectedRoute element={<Dashboard />} />}
        />

        <Route
          path="/courses"
          element={<ProtectedRoute element={<Courses />} />}
        />

        <Route
          path="/course/:courseId"
          element={<ProtectedRoute element={<CourseView />} />}
        />

        <Route
          path="/course/:courseId/lesson/:lessonId"
          element={<ProtectedRoute element={<LessonView />} />}
        />

        <Route
          path="/results"
          element={<ProtectedRoute element={<Results />} />}
        />

        <Route
          path="/progress"
          element={<ProtectedRoute element={<Progress />} />}
        />

        {/* ✅ ADMIN PROTECTION */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              element={
                JSON.parse(localStorage.getItem("learn_hub_user") || "{}")
                  ?.role === "admin" ? (
                  <Admin />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/select-exam" element={<SelectExam />} />
      </Routes>
    </BrowserRouter>
  );
}