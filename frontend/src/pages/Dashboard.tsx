import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [exams, setExams] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // =========================
  // LOAD COURSES
  // =========================
  useEffect(() => {
    const loadCourses = async () => {
      try {
        // ✅ LOAD LOCAL CACHE FIRST (FAST)
        const cachedCourses = JSON.parse(
          localStorage.getItem("learn_hub_courses") || "[]"
        );

        if (cachedCourses.length > 0) {
          setCourses(cachedCourses);

          const cachedExams = Array.from(
            new Set(
              cachedCourses
                .map((course: any) =>
                  String(
                    course.examId ||
                      course.exam ||
                      course.examName ||
                      ""
                  ).trim()
                )
                .filter((e: string) => e.length > 0)
            )
          );

          setExams(cachedExams as string[]);

          const savedExam =
            localStorage.getItem("selected_exam") || "";

          if (
            savedExam !== "undefined" &&
            savedExam !== "null" &&
            cachedExams.includes(savedExam)
          ) {
            setSelectedExam(savedExam);
          }
        }

        // ✅ BACKEND FETCH
        const res = await fetch(
          "https://learn-hub-backend-g1pi.onrender.com/courses"
        );

        const backendData = await res.json();

        const finalCourses = Array.isArray(backendData)
          ? backendData
          : [];

        // ✅ UPDATE STATE
        setCourses(finalCourses);

        // ✅ UPDATE CACHE
        localStorage.setItem(
          "learn_hub_courses",
          JSON.stringify(finalCourses)
        );

        // ✅ EXTRACT EXAMS
        const extractedExams = Array.from(
          new Set(
            finalCourses
              .map((course: any) =>
                String(
                  course.examId ||
                    course.exam ||
                    course.examName ||
                    ""
                ).trim()
              )
              .filter((e: string) => e.length > 0)
          )
        );

        setExams(extractedExams as string[]);

        const savedExam =
          localStorage.getItem("selected_exam") || "";

        if (
          savedExam !== "undefined" &&
          savedExam !== "null" &&
          extractedExams.includes(savedExam)
        ) {
          setSelectedExam(savedExam);
        }
      } catch (err) {
        console.log("Using cached courses");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // =========================
  // FILTER COURSES
  // =========================
  const filteredCourses = useMemo(() => {
    if (
      !selectedExam ||
      selectedExam === "All Exams"
    ) {
      return courses;
    }

    return courses.filter((c: any) => {
      const examValue =
        c.examId ||
        c.exam ||
        c.examName ||
        "";

      return (
        String(examValue)
          .trim()
          .toLowerCase() ===
        String(selectedExam)
          .trim()
          .toLowerCase()
      );
    });
  }, [courses, selectedExam]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            border: "5px solid #ddd",
            borderTop: "5px solid #667eea",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />

        <p style={{ marginTop: 20 }}>
          Loading courses...
        </p>

        <style>
          {`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div
      style={{
        padding: 20,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        📚 Available Courses
      </h1>

      {/* FILTER */}
      <div
        style={{
          marginBottom: 25,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <select
          value={selectedExam}
          onChange={(e) => {
            const value = e.target.value;

            setSelectedExam(value);

            localStorage.setItem(
              "selected_exam",
              value
            );
          }}
          style={{
            padding: 12,
            minWidth: 260,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        >
          <option value="">
            All Exams
          </option>

          {exams.map((exam, i) => (
            <option key={i} value={exam}>
              {exam}
            </option>
          ))}
        </select>
      </div>

      {/* EMPTY */}
      {filteredCourses.length === 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: 50,
          }}
        >
          <h3>No courses found</h3>
        </div>
      )}

      {/* COURSES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {filteredCourses.map((course: any) => (
          <div
            key={course.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 20,
              background: "#fff",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                marginBottom: 10,
                fontSize: 22,
              }}
            >
              {course.title || course.name}
            </h2>

            <p>
              <strong>Exam:</strong>{" "}
              {course.examId ||
                course.exam ||
                course.examName}
            </p>

            <p>
              <strong>Lessons:</strong>{" "}
              {course.lessons?.length || 0}
            </p>

            <button
              onClick={() =>
                navigate(`/course/${course.id}`)
              }
              style={{
                marginTop: 15,
                width: "100%",
                padding: 12,
                border: "none",
                borderRadius: 8,
                background: "#667eea",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              Open Course
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}