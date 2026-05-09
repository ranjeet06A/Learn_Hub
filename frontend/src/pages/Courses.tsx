import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const navigate = useNavigate();

  // =========================
  // LOAD COURSES
  // =========================
  useEffect(() => {
    const loadCourses =
      async () => {
        try {
          // ✅ LOAD CACHE FIRST
          const cached =
            JSON.parse(
              localStorage.getItem(
                "learn_hub_courses"
              ) || "[]"
            );

          if (
            Array.isArray(
              cached
            ) &&
            cached.length > 0
          ) {
            setCourses(
              cached
            );
          }

          // ✅ FETCH BACKEND
          const res =
            await fetch(
              "https://learn-hub-backend-g1pi.onrender.com/courses"
            );

          const data =
            await res.json();

          // ✅ SAFE ARRAY
          const finalCourses =
            Array.isArray(
              data
            )
              ? data.map(
                  (
                    c: any
                  ) => ({
                    ...c,
                    lessons:
                      Array.isArray(
                        c.lessons
                      )
                        ? c.lessons
                        : [],
                  })
                )
              : [];

          // ✅ UPDATE CACHE
          localStorage.setItem(
            "learn_hub_courses",
            JSON.stringify(
              finalCourses
            )
          );

          // ✅ UPDATE STATE
          setCourses(
            finalCourses
          );
        } catch (err) {
          console.log(
            "Using cached courses"
          );

          const stored =
            JSON.parse(
              localStorage.getItem(
                "learn_hub_courses"
              ) || "[]"
            );

          setCourses(
            Array.isArray(
              stored
            )
              ? stored
              : []
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadCourses();
  }, []);

  // =========================
  // SORT COURSES
  // =========================
  const sortedCourses =
    useMemo(() => {
      return [
        ...courses,
      ].sort(
        (
          a: any,
          b: any
        ) =>
          String(
            a.title ||
              a.name
          ).localeCompare(
            String(
              b.title ||
                b.name
            )
          )
      );
    }, [courses]);

  // =========================
  // LOADING UI
  // =========================
  if (loading) {
    return (
      <div
        style={{
          minHeight:
            "80vh",
          display:
            "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
          flexDirection:
            "column",
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            border:
              "5px solid #ddd",
            borderTop:
              "5px solid #667eea",
            borderRadius:
              "50%",
            animation:
              "spin 1s linear infinite",
          }}
        />

        <p
          style={{
            marginTop: 20,
          }}
        >
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
        margin:
          "0 auto",
      }}
    >
      <h1
        style={{
          textAlign:
            "center",
          marginBottom: 30,
        }}
      >
        📚 Courses
      </h1>

      {/* EMPTY */}
      {sortedCourses.length ===
        0 && (
        <div
          style={{
            textAlign:
              "center",
            marginTop: 50,
          }}
        >
          <h3>
            No courses found
          </h3>
        </div>
      )}

      {/* COURSE GRID */}
      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {sortedCourses.map(
          (
            course: any
          ) => (
            <div
              key={
                course._id ||
                course.id
              }
              style={{
                border:
                  "1px solid #ddd",
                borderRadius: 12,
                padding: 20,
                background:
                  "#fff",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.08)",
                transition:
                  "0.2s",
              }}
            >
              <h2
                style={{
                  marginBottom: 10,
                  fontSize: 22,
                }}
              >
                {course.title ||
                  course.name}
              </h2>

              <p>
                <strong>
                  Exam:
                </strong>{" "}
                {course.examId ||
                  course.exam ||
                  course.examName}
              </p>

              <p>
                <strong>
                  Lessons:
                </strong>{" "}
                {course
                  .lessons
                  ?.length ||
                  0}
              </p>

              <button
                onClick={() => {
                  navigate(
                    `/course/${
                      course._id ||
                      course.id
                    }`
                  );
                }}
                style={{
                  width:
                    "100%",
                  marginTop: 15,
                  padding: 12,
                  background:
                    "#667eea",
                  color:
                    "white",
                  border:
                    "none",
                  borderRadius: 8,
                  cursor:
                    "pointer",
                  fontWeight:
                    "bold",
                  fontSize: 16,
                }}
              >
                Open Course
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}