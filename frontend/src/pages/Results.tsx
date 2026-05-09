import api from "../utils/api";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

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

  const [loading, setLoading] =
    useState(true);

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

          // ✅ LOCAL CACHE FIRST
          const cached =
            JSON.parse(
              localStorage.getItem(
                "learn_hub_progress"
              ) || "[]"
            );

          if (
            Array.isArray(
              cached
            ) &&
            cached.length > 0
          ) {
            setResults(
              cached
            );
          }

          // ✅ BACKEND FETCH
          const data =
            await api.get(
              "/results"
            );

          if (
            Array.isArray(
              data
            ) &&
            data.length > 0
          ) {
            setResults(
              data
            );

            // ✅ UPDATE CACHE
            localStorage.setItem(
              "learn_hub_progress",
              JSON.stringify(
                data
              )
            );
          }
        } catch (err) {
          const stored =
            JSON.parse(
              localStorage.getItem(
                "learn_hub_progress"
              ) || "[]"
            );

          setResults(
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

    loadResults();
  }, [navigate]);

  // =========================
  // COURSES CACHE
  // =========================
  const courses =
    useMemo(() => {
      return JSON.parse(
        localStorage.getItem(
          "learn_hub_courses"
        ) || "[]"
      );
    }, []);

  // =========================
  // GET COURSE NAME
  // =========================
  const getCourseName = (
    courseId: string
  ) => {
    const c =
      courses.find(
        (c: any) =>
          String(
            c.id ||
              c._id
          ) ===
          String(
            courseId
          )
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
    const c =
      courses.find(
        (c: any) =>
          String(
            c.id ||
              c._id
          ) ===
          String(
            courseId
          )
      );

    const l =
      c?.lessons?.find(
        (l: any) =>
          String(
            l.id ||
              l._id
          ) ===
          String(
            lessonId
          )
      );

    return (
      l?.title ||
      l?.name ||
      "Lesson"
    );
  };

  // =========================
  // GROUP RESULTS
  // =========================
  const grouped =
    useMemo(() => {
      const data: any =
        {};

      results.forEach(
        (r) => {
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
            r.quizIndex ??
            0;

          if (
            !data[
              course
            ]
          )
            data[
              course
            ] = {};

          if (
            !data[
              course
            ][lesson]
          )
            data[
              course
            ][lesson] =
              {};

          if (
            !data[
              course
            ][lesson][
              quiz
            ]
          )
            data[
              course
            ][lesson][
              quiz
            ] = [];

          data[
            course
          ][lesson][
            quiz
          ].push(r);
        }
      );

      return data;
    }, [results]);

  // =========================
  // LOADING
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
          Loading results...
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
  // EMPTY
  // =========================
  if (
    results.length ===
    0
  ) {
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
          style={{
            marginTop: 20,
            padding:
              "12px 20px",
            border:
              "none",
            borderRadius: 8,
            background:
              "#667eea",
            color:
              "white",
            cursor:
              "pointer",
            fontWeight:
              "bold",
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div
      style={{
        background:
          "#f3f4f6",
        minHeight:
          "100vh",
        padding:
          window.innerWidth <
          768
            ? 15
            : 30,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin:
            "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            textAlign:
              "center",
            marginBottom: 30,
          }}
        >
          <h1>
            📊 Quiz Results
          </h1>
        </div>

        {/* RESULTS */}
        {Object.keys(
          grouped
        ).map(
          (course) => (
            <div
              key={
                course
              }
              style={{
                marginBottom: 35,
              }}
            >
              <h2
                style={{
                  marginBottom: 20,
                }}
              >
                📘 {course}
              </h2>

              {Object.keys(
                grouped[
                  course
                ]
              ).map(
                (
                  lesson
                ) => (
                  <div
                    key={
                      lesson
                    }
                    style={{
                      marginBottom: 25,
                    }}
                  >
                    <h3>
                      📖{" "}
                      {
                        lesson
                      }
                    </h3>

                    {Object.keys(
                      grouped[
                        course
                      ][lesson]
                    ).map(
                      (
                        quiz
                      ) => (
                        <div
                          key={
                            quiz
                          }
                          style={{
                            marginTop: 20,
                          }}
                        >
                          <h4>
                            📝
                            Quiz{" "}
                            {Number(
                              quiz
                            ) +
                              1}
                          </h4>

                          <div
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(280px, 1fr))",
                              gap: 20,
                              marginTop: 15,
                            }}
                          >
                            {grouped[
                              course
                            ][
                              lesson
                            ][
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

                                let attemptDate =
                                  "N/A";

                                let attemptTime =
                                  "N/A";

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
                                      background:
                                        "white",
                                      borderRadius: 14,
                                      padding: 20,
                                      boxShadow:
                                        "0 4px 12px rgba(0,0,0,0.08)",
                                    }}
                                  >
                                    <h3>
                                      Attempt{" "}
                                      {index +
                                        1}
                                    </h3>

                                    <p>
                                      📅{" "}
                                      {
                                        attemptDate
                                      }
                                    </p>

                                    <p>
                                      🕒{" "}
                                      {
                                        attemptTime
                                      }
                                    </p>

                                    <p>
                                      ⏱{" "}
                                      {formatTime(
                                        timeSpent
                                      )}
                                    </p>

                                    <hr />

                                    <p>
                                      🎯
                                      Score:
                                      {" "}
                                      {score}
                                    </p>

                                    <p>
                                      ✅
                                      Correct:
                                      {" "}
                                      {
                                        correct
                                      }
                                    </p>

                                    <p>
                                      ❌
                                      Wrong:
                                      {" "}
                                      {
                                        wrong
                                      }
                                    </p>

                                    <p>
                                      📊
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
                        </div>
                      )
                    )}
                  </div>
                )
              )}
            </div>
          )
        )}

        {/* BACK */}
        <div
          style={{
            textAlign:
              "center",
            marginTop: 40,
          }}
        >
          <button
            onClick={() =>
              navigate("/")
            }
            style={{
              padding:
                "12px 24px",
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
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}