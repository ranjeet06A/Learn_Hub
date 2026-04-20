import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { courseManager } from "../utils/adminManager";
import { enrollmentManager } from "../utils/enrollmentManager";
import { authManager } from "../utils/authManager";
import type { Course } from "../utils/adminManager";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(authManager.getCurrentUser());

  // Initialize currentUser once on mount
  useEffect(() => {
    setCurrentUser(authManager.getCurrentUser());
  }, []);

  // Fetch course and check enrollment when id changes
  useEffect(() => {
    if (id) {
      const fetchedCourse = courseManager.getCourseById(Number(id));
      setCourse(fetchedCourse);
      
      if (currentUser) {
        const enrolled = enrollmentManager.isEnrolled(currentUser.id, Number(id));
        setIsEnrolled(enrolled);
      }
    }
  }, [id, currentUser]);

  const handleEnroll = () => {
    if (!currentUser) return;
    
    const result = enrollmentManager.enrollCourse(currentUser.id, Number(id));
    if (result.success) {
      setIsEnrolled(true);
    }
  };

  if (!course) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        <h2>Course not found</h2>
        <button onClick={() => navigate("/courses")}>Back to Courses</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingBottom: "50px" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "40px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "32px", marginBottom: "10px", fontWeight: "700" }}>
            📘 {course.title}
          </h1>
          <p style={{ opacity: 0.9 }}>{course.description}</p>
        </div>
        <button
          onClick={() => navigate("/courses")}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ← Back
        </button>
      </div>

      {/* Lessons Grid */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "50px 30px" }}>
        {!isEnrolled ? (
          // Enrollment CTA
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "60px 30px",
                textAlign: "center",
              }}
            >
              <h2 style={{ fontSize: "28px", marginBottom: "15px", fontWeight: "700" }}>
                Ready to Start This Course?
              </h2>
              <p style={{ fontSize: "16px", marginBottom: "30px", opacity: 0.9 }}>
                Enroll now to access all {course.lessons.length} lessons and start learning
              </p>
              <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={handleEnroll}
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
                  📝 Enroll Now
                </button>
                <button
                  onClick={() => navigate("/courses")}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    border: "2px solid white",
                    padding: "12px 40px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                  }}
                >
                  Browse More Courses
                </button>
              </div>
            </div>
            <div style={{ padding: "40px 30px", textAlign: "center" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>📖</div>
                  <p style={{ color: "#667eea", fontWeight: "700", margin: 0 }}>{course.lessons.length} Lessons</p>
                </div>
                <div>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>⏱️</div>
                  <p style={{ color: "#667eea", fontWeight: "700", margin: 0 }}>Self-paced</p>
                </div>
                <div>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>📊</div>
                  <p style={{ color: "#667eea", fontWeight: "700", margin: 0 }}>Track Progress</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Show lessons after enrollment
          <>
            <h2 style={{ color: "#333", marginBottom: "30px" }}>
              📚 Lessons ({course.lessons.length})
            </h2>

            {course.lessons.length === 0 ? (
              <div
                style={{
                  background: "white",
                  padding: "40px",
                  borderRadius: "12px",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                }}
              >
                <p style={{ fontSize: "16px", color: "#999" }}>
                  No lessons available in this course yet.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {course.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    style={{
                      background: "white",
                      padding: "25px",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/course/${id}/lesson/${lesson.id}`)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.12)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}>
                      <div style={{ fontSize: "32px" }}>📖</div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#333", marginTop: 0, marginBottom: "8px" }}>
                          {lesson.title}
                        </h3>
                        <p style={{ color: "#666", fontSize: "14px", marginBottom: "15px", minHeight: "50px" }}>
                          {lesson.content}
                        </p>
                        <button
                          style={{
                            backgroundColor: "#667eea",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "14px",
                            width: "100%",
                          }}
                        >
                          Start Lesson →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
