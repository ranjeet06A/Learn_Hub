import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const navigate = useNavigate();

  const [exams, setExams] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState(
    localStorage.getItem("selected_exam") || ""
  );

  useEffect(() => {
    const stored = localStorage.getItem("learn_hub_courses");
    const data = stored ? JSON.parse(stored) : [];

    const storedExams = localStorage.getItem("learn_hub_exams");
    const examData = storedExams ? JSON.parse(storedExams) : [];

    console.log("📚 ALL COURSES:", data);

    setCourses(data);
    setExams(examData);
  }, []);

  const filteredCourses = selectedExam
    ? courses.filter((c) => c.examId === selectedExam)
    : courses;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "linear-gradient(135deg, #eef2ff, #f8fafc)", // ✅ softer
      }}
    >
      <h1
        style={{
          marginBottom: "20px",
          color: "#1e293b", // ✅ darker clean text
          textAlign: "center",
        }}
      >
        📚 Available Courses
      </h1>

      <div
        style={{
          marginBottom: 30,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <select
          value={selectedExam}
          onChange={(e) => {
            setSelectedExam(e.target.value);
            localStorage.setItem("selected_exam", e.target.value);
          }}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "white",
            fontSize: "15px",
          }}
        >
          <option value="">All Exams</option>
          {exams.map((exam, i) => (
            <option key={i} value={exam}>
              {exam}
            </option>
          ))}
        </select>
      </div>

      {filteredCourses.length === 0 && (
        <p style={{ color: "#64748b", textAlign: "center" }}>
          No courses found
        </p>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "800px",
          margin: "auto",
        }}
      >
        {filteredCourses.map((course: any) => (
          <div
            key={course.id}
            style={{
              background: "white",
              padding: "22px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)", // ✅ softer shadow
              border: "1px solid #e2e8f0",
            }}
          >
            <h2 style={{ marginBottom: 10, color: "#0f172a" }}>
              {course.title || course.name}
            </h2>

            <p style={{ color: "#475569" }}>
              📘 Lessons: {course.lessons?.length || 0}
            </p>

            <p style={{ fontSize: "13px", color: "#64748b" }}>
              🎯 Exam: {course.examId}
            </p>

            <div style={{ display: "flex", gap: "10px", marginTop: 15 }}>
              <button
                onClick={() => {
                  if (course.lessons && course.lessons.length > 0) {
                    navigate(
                      `/course/${course.id}/lesson/${course.lessons[0].id}`
                    );
                  } else {
                    alert("No lessons available in this course");
                  }
                }}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#4f46e5", // ✅ elegant blue
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Open Course
              </button>

              <button
                onClick={() => navigate(`/course/${course.id}`)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#f1f5f9", // ✅ subtle grey
                  cursor: "pointer",
                  color: "#334155",
                }}
              >
                View Lessons
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}