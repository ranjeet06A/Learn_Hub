import api from "../utils/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// =========================
// LOAD COURSES
// =========================
const courses = JSON.parse(
  localStorage.getItem("learn_hub_courses") || "[]"
);

// =========================
// GET COURSE NAME
// =========================
const getCourseName = (
  courseId: string
) => {
  const c = courses.find(
    (c: any) =>
      String(c.id) ===
      String(courseId)
  );

  return (
    c?.title ||
    c?.name ||
    "Unknown Course"
  );
};

// =========================
// GET LESSON NAME
// =========================
const getLessonName = (
  courseId: string,
  lessonId: string
) => {
  const c = courses.find(
    (c: any) =>
      String(c.id) ===
      String(courseId)
  );

  const l =
    c?.lessons?.find(
      (l: any) =>
        String(l.id) ===
        String(lessonId)
    );

  return (
    l?.title ||
    l?.name ||
    "Lesson"
  );
};

// =========================
// FORMAT TIME
// =========================
const formatTime = (
  seconds: number
) => {
  const mins = Math.floor(
    seconds / 60
  );

  const secs =
    seconds % 60;

  return `${mins}m ${secs}s`;
};

export default function Results() {
  const navigate =
    useNavigate();

  const [results, setResults] =
    useState<any[]>([]);

  // =========================
  // LOAD RESULTS
  // =========================
  useEffect(() => {
    const loadResults =
      async () => {
        try {
          const token =
            localStorage.getItem(
              "token"
            );

          if (!token) {
            navigate(
              "/login"
            );
            return;
          }

          // =========================
          // BACKEND RESULTS
          // =========================
          const data =
            await api.get(
              "/results"
            );

          console.log(
            "RESULTS FROM BACKEND:",
            data
          );

          if (
            data &&
            data.length > 0
          ) {
            setResults(data);
            return;
          }
        } catch (err) {
          console.log(
            "Backend failed, using localStorage"
          );
        }

        // =========================
        // LOCAL STORAGE FALLBACK
        // =========================
        const stored =
          JSON.parse(
            localStorage.getItem(
              "learn_hub_progress"
            ) || "[]"
          );

        console.log(
          "RESULTS FROM LOCAL:",
          stored
        );

        setResults(stored);
      };

    loadResults();
  }, [navigate]);

  // =========================
  // EMPTY
  // =========================
  if (!results.length) {
    return (
      <div
        style={{
          padding: 30,
          textAlign:
            "center",
        }}
      >
        <h2>
          No result found
        </h2>

        <button
          onClick={() =>
            navigate("/")
          }
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // =========================
  // GROUP RESULTS
  // =========================
  const grouped: any =
    {};

  results.forEach((r) => {
    const course =
      r.courseName ||
      getCourseName(
        r.courseId
      );

    const lesson =
      r.lessonName ||
      getLessonName(
        r.courseId,
        r.lessonId
      );

    const quiz =
      r.quizIndex ?? 0;

    if (!grouped[course])
      grouped[course] =
        {};

    if (
      !grouped[course][
        lesson
      ]
    )
      grouped[course][
        lesson
      ] = {};

    if (
      !grouped[course][
        lesson
      ][quiz]
    )
      grouped[course][
        lesson
      ][quiz] = [];

    grouped[course][
      lesson
    ][quiz].push(r);
  });

  // =========================
  // UI
  // =========================
  return (
    <div
      style={{
        padding: 30,
      }}
    >
      <h1
        style={{
          textAlign:
            "center",
        }}
      >
        📊 Quiz Results
      </h1>

      {Object.keys(
        grouped
      ).map((course) => (
        <div
          key={course}
          style={{
            marginTop: 30,
          }}
        >
          <h2>
            📘 {course}
          </h2>

          {Object.keys(
            grouped[course]
          ).map((lesson) => (
            <div
              key={lesson}
              style={{
                marginLeft: 20,
              }}
            >
              <h3>
                📖 {lesson}
              </h3>

              {Object.keys(
                grouped[
                  course
                ][lesson]
              ).map(
                (quiz) => (
                  <div
                    key={quiz}
                    style={{
                      marginLeft: 20,
                    }}
                  >
                    <h4>
                      📝 Quiz{" "}
                      {Number(
                        quiz
                      ) + 1}
                    </h4>

                    {grouped[
                      course
                    ][lesson][
                      quiz
                    ].map(
                      (
                        r: any,
                        index: number
                      ) => {
                        const total =
                          r.total ??
                          0;

                        const score =
                          r.score ??
                          0;

                        const correct =
                          r.correct ??
                          0;

                        const wrong =
                          r.wrong ??
                          0;

                        // =========================
                        // DATE FIX
                        // =========================
                        let attemptDate =
                          "N/A";

                        let attemptTime =
                          "N/A";

                        // NEW FORMAT
                        if (
                          r.attemptDate
                        ) {
                          attemptDate =
                            r.attemptDate;
                        }

                        if (
                          r.attemptTime
                        ) {
                          attemptTime =
                            r.attemptTime;
                        }

                        // OLD FORMAT SUPPORT
                        if (
                          r.createdAt
                        ) {
                          const d =
                            new Date(
                              r.createdAt
                            );

                          attemptDate =
                            d.toLocaleDateString();

                          attemptTime =
                            d.toLocaleTimeString();
                        }

                        const timeSpent =
                          r.timeSpent ||
                          0;

                        const percentage =
                          total >
                          0
                            ? (score /
                                total) *
                              100
                            : 0;

                        return (
                          <div
                            key={
                              index
                            }
                            style={{
                              border:
                                "1px solid #ccc",
                              marginBottom: 10,
                              padding: 15,
                              borderRadius: 8,
                              background:
                                "#f9fafb",
                            }}
                          >
                            <strong>
                              Attempt{" "}
                              {index +
                                1}
                            </strong>

                            <p>
                              📅
                              Attempt
                              Date:
                              {" "}
                              {
                                attemptDate
                              }
                            </p>

                            <p>
                              🕒
                              Attempt
                              Time:
                              {" "}
                              {
                                attemptTime
                              }
                            </p>

                            <p>
                              ⏱
                              Time
                              Spent:
                              {" "}
                              {formatTime(
                                timeSpent
                              )}
                            </p>

                            <p>
                              Score:
                              {" "}
                              {
                                score
                              }
                            </p>

                            <p>
                              Correct:
                              {" "}
                              {
                                correct
                              }
                            </p>

                            <p>
                              Wrong:
                              {" "}
                              {
                                wrong
                              }
                            </p>

                            <p>
                              Percentage:
                              {" "}
                              {percentage.toFixed(
                                2
                              )}
                              %
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      ))}

      <div
        style={{
          textAlign:
            "center",
          marginTop: 30,
        }}
      >
        <button
          onClick={() =>
            navigate("/")
          }
          style={{
            padding:
              "10px 20px",
            background:
              "#667eea",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}