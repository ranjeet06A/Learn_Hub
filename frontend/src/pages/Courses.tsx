import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] =
    useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        // ✅ FETCH FROM BACKEND
        const res = await fetch(
          "https://learn-hub-backend-g1pi.onrender.com/courses"
        );

        const data = await res.json();

        console.log(
          "RAW BACKEND DATA:",
          data
        );

        // ✅ SAFE ARRAY
        const finalCourses =
          Array.isArray(data)
            ? data.map((c: any) => ({
                ...c,
                lessons:
                  Array.isArray(
                    c.lessons
                  )
                    ? c.lessons
                    : [],
              }))
            : [];

        console.log(
          "FINAL COURSES ARRAY:",
          finalCourses
        );

        // ✅ SAVE CACHE
        localStorage.setItem(
          "learn_hub_courses",
          JSON.stringify(
            finalCourses
          )
        );

        setCourses(finalCourses);
      } catch (err) {
        console.log(
          "Backend failed, using localStorage"
        );

        // ✅ FALLBACK LOCAL
        const stored =
          JSON.parse(
            localStorage.getItem(
              "learn_hub_courses"
            ) || "[]"
          );

        setCourses(
          Array.isArray(stored)
            ? stored
            : []
        );
      }
    };

    loadCourses();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>📚 Courses</h1>

      {courses.length === 0 && (
        <p>No courses found</p>
      )}

      {courses.map(
        (course: any) => (
          <div
            key={
              course._id ||
              course.id
            }
            style={{
              border:
                "1px solid #ccc",
              padding: 20,
              marginBottom: 15,
              borderRadius: 8,
            }}
          >
            <h2>
              {course.title ||
                course.name}
            </h2>

            <p>
              Exam:{" "}
              {course.examId ||
                course.exam ||
                course.examName}
            </p>

            <p>
              Lessons:{" "}
              {course.lessons
                ?.length || 0}
            </p>

            <button
              onClick={() => {
                console.log(
                  "OPENING COURSE:",
                  course
                );

                navigate(
                  `/course/${
                    course._id ||
                    course.id
                  }`
                );
              }}
              style={{
                padding:
                  "10px 14px",
                background:
                  "#667eea",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Open Course
            </button>
          </div>
        )
      )}
    </div>
  );
}