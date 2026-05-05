import { Routes, Route, Navigate } from "react-router-dom";
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

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuth(!!localStorage.getItem("token"));
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    window.addEventListener("focus", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  return (
    <>
      {isAuth && <Navbar />}

      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* PROTECTED */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId"
          element={
            <ProtectedRoute>
              <CourseView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId/lesson/:lessonId"
          element={
            <ProtectedRoute>
              <LessonView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />

        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              {JSON.parse(localStorage.getItem("learn_hub_user") || "{}")
                ?.role === "admin" ? (
                <Admin />
              ) : (
                <Navigate to="/" />
              )}
            </ProtectedRoute>
          }
        />

        {/* EXTRA */}
        <Route path="/select-exam" element={<SelectExam />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}