import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { courseManager } from "../utils/adminManager";
import { enrollmentManager } from "../utils/enrollmentManager";
import { progressManager } from "../utils/progressManager";
import { authManager } from "../utils/authManager";
import type { Course } from "../utils/adminManager";

const stats = [
  { label: "Courses Available", value: "12", icon: "📚" },
  { label: "Learning Hours", value: "500+", icon: "⏱️" },
  { label: "Students", value: "5K+", icon: "👥" },
  { label: "Completion Rate", value: "94%", icon: "✅" },
];

const courseIcons = ["🧮", "⚛️", "🧪", "🧬", "📚", "🎨", "🏃", "🌍"];
const courseColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#FF9999", "#99D5FF", "#FFCC99", "#99FF99"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<number, { completed: number; total: number; percentage: number }>>({});
  const [currentUser, setCurrentUser] = useState(authManager.getCurrentUser());

  useEffect(() => {
    setCurrentUser(authManager.getCurrentUser());
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Get all courses
    const allCourses = courseManager.getAllCourses();
    
    // Get enrolled course IDs
    const enrolledIds = enrollmentManager.getEnrolledCourseIds(currentUser.id);
    
    // Filter courses that are enrolled
    const enrolled = allCourses.filter((course) => enrolledIds.includes(course.id));
    setEnrolledCourses(enrolled);

    // Calculate progress for each enrolled course
    const progressMap: Record<number, { completed: number; total: number; percentage: number }> = {};
    
    enrolled.forEach((course) => {
      const userProgress = progressManager.getAllProgress(currentUser.id);
      const courseProgressItems = userProgress.filter((p) => p.courseId === course.id);
      const completedLessons = new Set(courseProgressItems.map((p) => p.lessonId)).size;
      const totalLessons = course.lessons.length;
      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      progressMap[course.id] = {
        completed: completedLessons,
        total: totalLessons,
        percentage,
      };
    });
    
    setCourseProgress(progressMap);
  }, [currentUser]);

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "60px 30px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "42px", marginBottom: "10px", fontWeight: "700" }}>
          Welcome to Learn Hub 🎓
        </h1>
        <p style={{ fontSize: "18px", opacity: 0.9, marginBottom: "30px" }}>
          {enrolledCourses.length > 0
            ? `Continue learning! You're enrolled in ${enrolledCourses.length} course${enrolledCourses.length !== 1 ? 's' : ''}`
            : 'Elevate your learning journey with world-class courses and expert instruction'}
        </p>
        {enrolledCourses.length === 0 && (
          <Link to="/courses" style={{ textDecoration: "none" }}>
            <button
              style={{
                backgroundColor: "#FF6B6B",
                color: "white",
                border: "none",
                padding: "14px 40px",
                fontSize: "16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
              }}
            >
              Explore Courses →
            </button>
          </Link>
        )}
      </div>

      {/* Stats Section */}
      <div style={{ padding: "50px 30px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "28px", marginBottom: "40px", textAlign: "center", color: "#333" }}>
          Our Learning Platform
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "60px",
          }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.12)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>{stat.icon}</div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#667eea", margin: "10px 0" }}>
                {stat.value}
              </h3>
              <p style={{ color: "#666", fontSize: "14px" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Enrolled Courses Section */}
        {enrolledCourses.length > 0 && (
          <>
            <h2 style={{ fontSize: "28px", marginBottom: "40px", textAlign: "center", color: "#333" }}>
              📚 Your Enrolled Courses
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "25px",
                marginBottom: "60px",
              }}
            >
              {enrolledCourses.map((course, index) => {
                const progress = courseProgress[course.id] || { completed: 0, total: course.lessons.length, percentage: 0 };
                
                return (
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

                      {/* Progress Bar */}
                      <div style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>
                            Progress
                          </span>
                          <span style={{ fontSize: "12px", color: "#667eea", fontWeight: "700" }}>
                            {progress.percentage}%
                          </span>
                        </div>
                        <div
                          style={{
                            background: "#e0e0e0",
                            height: "6px",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              background: `linear-gradient(90deg, #667eea 0%, #764ba2 100%)`,
                              height: "100%",
                              width: `${progress.percentage}%`,
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                        <p style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>
                          {progress.completed} of {progress.total} lessons completed
                        </p>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
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
                        <span style={{ color: "#667eea", fontWeight: "600", fontSize: "14px" }}>
                          Continue →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* CTA Section */}
        {enrolledCourses.length === 0 ? (
          <div
            style={{
              background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
              color: "white",
              padding: "60px 30px",
              textAlign: "center",
              borderRadius: "12px",
              marginTop: "60px",
            }}
          >
            <h2 style={{ fontSize: "32px", marginBottom: "15px", fontWeight: "700" }}>
              Ready to Start Learning?
            </h2>
            <p style={{ fontSize: "16px", opacity: 0.9, marginBottom: "30px" }}>
              Join thousands of students on their path to success
            </p>
            <Link to="/courses" style={{ textDecoration: "none" }}>
              <button
                style={{
                  backgroundColor: "#FFE66D",
                  color: "#333",
                  border: "none",
                  padding: "14px 40px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
                }}
              >
                Browse All Courses
              </button>
            </Link>
          </div>
        ) : (
          <div
            style={{
              background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
              color: "white",
              padding: "60px 30px",
              textAlign: "center",
              borderRadius: "12px",
              marginTop: "60px",
            }}
          >
            <h2 style={{ fontSize: "32px", marginBottom: "15px", fontWeight: "700" }}>
              Explore More Courses?
            </h2>
            <p style={{ fontSize: "16px", opacity: 0.9, marginBottom: "30px" }}>
              Discover other courses available on the platform
            </p>
            <Link to="/courses" style={{ textDecoration: "none" }}>
              <button
                style={{
                  backgroundColor: "#FFE66D",
                  color: "#333",
                  border: "none",
                  padding: "14px 40px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
                }}
              >
                Browse Courses
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


