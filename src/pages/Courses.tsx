import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { courseManager } from "../utils/adminManager";
import { enrollmentManager } from "../utils/enrollmentManager";
import { authManager } from "../utils/authManager";
import type { Course } from "../utils/adminManager";

const courseIcons = ["🧮", "⚛️", "🧪", "🧬", "📚", "🎨", "🏃", "🌍"];
const courseColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#FF9999", "#99D5FF", "#FFCC99", "#99FF99"];

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([]);
  const currentUser = authManager.getCurrentUser();

  useEffect(() => {
    setCourses(courseManager.getAllCourses());
    if (currentUser) {
      setEnrolledCourseIds(enrollmentManager.getEnrolledCourseIds(currentUser.id));
    }
  }, [currentUser]);

  const handleEnroll = (e: React.MouseEvent, courseId: number) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    const result = enrollmentManager.enrollCourse(currentUser.id, courseId);
    if (result.success) {
      setEnrolledCourseIds([...enrolledCourseIds, courseId]);
    }
  };

  const handleUnenroll = (e: React.MouseEvent, courseId: number) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    const result = enrollmentManager.unenrollCourse(currentUser.id, courseId);
    if (result.success) {
      setEnrolledCourseIds(enrolledCourseIds.filter((id) => id !== courseId));
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingBottom: "50px" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "50px 30px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "42px", marginBottom: "10px", fontWeight: "700" }}>
          📚 Browse Courses
        </h1>
        <p style={{ fontSize: "18px", opacity: 0.9 }}>
          Choose from our collection of expertly-crafted courses
        </p>
      </div>

      {/* Courses Grid */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "50px 30px" }}>
        {courses.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "50px",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <p style={{ fontSize: "18px", color: "#999" }}>No courses available yet.</p>
            <p style={{ color: "#999" }}>Check back later or contact the administrator.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "25px",
            }}
          >
            {courses.map((course, index) => (
              <div
                key={course.id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/course/${course.id}`)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
                }}
              >
                <div
                  style={{
                    background: courseColors[index % courseColors.length],
                    height: "140px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "60px",
                  }}
                >
                  {courseIcons[index % courseIcons.length]}
                </div>
                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#333", marginBottom: "8px" }}>
                    {course.title}
                  </h3>
                  <p style={{ color: "#666", fontSize: "14px", marginBottom: "15px", minHeight: "40px" }}>
                    {course.description}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        backgroundColor: "#f0f0f0",
                        color: "#667eea",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      📖 {course.lessons.length} lessons
                    </span>
                    {enrolledCourseIds.includes(course.id) ? (
                      <button
                        onClick={(e) => handleUnenroll(e, course.id)}
                        style={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: "pointer",
                          transition: "opacity 0.3s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
                        onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        ✓ Enrolled
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleEnroll(e, course.id)}
                        style={{
                          background: "#667eea",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: "pointer",
                          transition: "background-color 0.3s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#764ba2")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#667eea")}
                      >
                        Enroll →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
