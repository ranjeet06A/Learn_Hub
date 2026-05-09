import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { courseManager } from "../utils/adminManager";

import { enrollmentManager } from "../utils/enrollmentManager";

import { authManager } from "../utils/authManager";

import type { Course } from "../utils/adminManager";

export default function CourseDetail() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const [course, setCourse] =
    useState<Course | null>(
      null
    );

  const [isEnrolled, setIsEnrolled] =
    useState(false);

  const [userId, setUserId] =
    useState<string | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {
    const user =
      authManager.getCurrentUser();

    setUserId(
      user?.id || null
    );
  }, []);

  // =========================
  // LOAD COURSE
  // =========================
  useEffect(() => {
    const loadCourse =
      async () => {
        try {
          if (!id) return;

          // ✅ LOCAL CACHE FIRST
          const cachedCourses =
            JSON.parse(
              localStorage.getItem(
                "learn_hub_courses"
              ) || "[]"
            );

          const cached =
            cachedCourses.find(
              (c: any) =>
                String(
                  c.id ||
                    c._id
                ) ===
                String(id)
            );

          if (cached) {
            setCourse(cached);
          }

          // ✅ ADMIN MANAGER
          const fetchedCourse =
            courseManager.getCourseById(
              Number(id)
            );

          if (
            fetchedCourse
          ) {
            setCourse(
              fetchedCourse
            );
          }
        } catch (err) {
          console.log(
            "Course load failed"
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadCourse();
  }, [id]);

  // =========================
  // ENROLLMENT CHECK
  // =========================
  useEffect(() => {
    if (
      userId &&
      course
    ) {
      const enrolled =
        enrollmentManager.isEnrolled(
          userId,
          course.id
        );

      setIsEnrolled(
        enrolled
      );
    }
  }, [
    userId,
    course?.id,
  ]);

  // =========================
  // ENROLL
  // =========================
  const handleEnroll =
    () => {
      if (!userId)
        return;

      const result =
        enrollmentManager.enrollCourse(
          userId,
          Number(id)
        );

      if (
        result.success
      ) {
        setIsEnrolled(
          true
        );
      }
    };

  // =========================
  // SORT LESSONS
  // =========================
  const sortedLessons =
    useMemo(() => {
      return [
        ...(course?.lessons ||
          []),
      ];
    }, [course]);

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
          Loading course...
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
  // COURSE NOT FOUND
  // =========================
  if (!course) {
    return (
      <div
        style={{
          padding: 30,
          textAlign:
            "center",
        }}
      >
        <h2>
          Course not found
        </h2>

        <button
          onClick={() =>
            navigate(
              "/courses"
            )
          }
        >
          Back to Courses
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
        backgroundColor:
          "#f8f9fa",
        minHeight:
          "100vh",
        paddingBottom: 50,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color:
            "white",
          padding:
            window.innerWidth <
            768
              ? "30px 20px"
              : "40px 30px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin:
              "0 auto",
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: 20,
            flexWrap:
              "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize:
                  window.innerWidth <
                  768
                    ? "28px"
                    : "36px",
                marginBottom: 10,
              }}
            >
              📘{" "}
              {course.title}
            </h1>

            <p
              style={{
                opacity: 0.9,
                maxWidth: 700,
                lineHeight: 1.6,
              }}
            >
              {
                course.description
              }
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                "/courses"
              )
            }
            style={{
              background:
                "rgba(255,255,255,0.2)",
              color:
                "white",
              border:
                "none",
              padding:
                "12px 20px",
              borderRadius: 8,
              cursor:
                "pointer",
              fontWeight:
                "bold",
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* BODY */}
      <div
        style={{
          maxWidth: 1200,
          margin:
            "0 auto",
          padding:
            window.innerWidth <
            768
              ? 20
              : 30,
        }}
      >
        {/* NOT ENROLLED */}
        {!isEnrolled ? (
          <div
            style={{
              background:
                "white",
              borderRadius: 14,
              overflow:
                "hidden",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color:
                  "white",
                padding:
                  window.innerWidth <
                  768
                    ? "40px 20px"
                    : "60px 30px",
                textAlign:
                  "center",
              }}
            >
              <h2
                style={{
                  fontSize:
                    window.innerWidth <
                    768
                      ? 24
                      : 30,
                }}
              >
                Ready to Start?
              </h2>

              <p
                style={{
                  marginTop: 15,
                  lineHeight: 1.7,
                }}
              >
                Enroll now to
                access all{" "}
                {
                  course
                    .lessons
                    .length
                }{" "}
                lessons.
              </p>

              <div
                style={{
                  marginTop: 30,
                  display:
                    "flex",
                  gap: 15,
                  justifyContent:
                    "center",
                  flexWrap:
                    "wrap",
                }}
              >
                <button
                  onClick={
                    handleEnroll
                  }
                  style={{
                    background:
                      "#FFE66D",
                    color:
                      "#333",
                    border:
                      "none",
                    padding:
                      "14px 35px",
                    borderRadius: 10,
                    cursor:
                      "pointer",
                    fontWeight:
                      "bold",
                    fontSize: 16,
                  }}
                >
                  📝 Enroll Now
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "/courses"
                    )
                  }
                  style={{
                    background:
                      "transparent",
                    color:
                      "white",
                    border:
                      "2px solid white",
                    padding:
                      "12px 35px",
                    borderRadius: 10,
                    cursor:
                      "pointer",
                    fontWeight:
                      "bold",
                  }}
                >
                  Browse More
                </button>
              </div>
            </div>

            {/* STATS */}
            <div
              style={{
                padding: 30,
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 20,
                textAlign:
                  "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 30,
                  }}
                >
                  📖
                </div>

                <p>
                  {
                    course
                      .lessons
                      .length
                  }{" "}
                  Lessons
                </p>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 30,
                  }}
                >
                  ⏱️
                </div>

                <p>
                  Self-paced
                </p>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 30,
                  }}
                >
                  📊
                </div>

                <p>
                  Track
                  Progress
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* LESSONS HEADER */}
            <div
              style={{
                marginBottom: 30,
              }}
            >
              <h2>
                📚 Lessons (
                {
                  sortedLessons.length
                }
                )
              </h2>
            </div>

            {/* EMPTY */}
            {sortedLessons.length ===
            0 ? (
              <div
                style={{
                  background:
                    "white",
                  padding: 40,
                  borderRadius: 12,
                  textAlign:
                    "center",
                }}
              >
                <p>
                  No lessons
                  available.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 20,
                }}
              >
                {sortedLessons.map(
                  (
                    lesson
                  ) => (
                    <div
                      key={
                        lesson.id
                      }
                      onClick={() =>
                        navigate(
                          `/course/${id}/lesson/${lesson.id}`
                        )
                      }
                      style={{
                        background:
                          "white",
                        padding: 22,
                        borderRadius: 14,
                        cursor:
                          "pointer",
                        boxShadow:
                          "0 4px 12px rgba(0,0,0,0.08)",
                        transition:
                          "0.2s",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          gap: 15,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 30,
                          }}
                        >
                          📖
                        </div>

                        <div
                          style={{
                            flex: 1,
                          }}
                        >
                          <h3
                            style={{
                              marginTop: 0,
                              marginBottom: 10,
                              fontSize: 20,
                            }}
                          >
                            {
                              lesson.title
                            }
                          </h3>

                          <p
                            style={{
                              color:
                                "#666",
                              fontSize: 14,
                              lineHeight: 1.6,
                              minHeight: 50,
                            }}
                          >
                            {String(
                              lesson.content ||
                                ""
                            ).slice(
                              0,
                              100
                            )}
                            ...
                          </p>

                          <button
                            style={{
                              marginTop: 15,
                              width:
                                "100%",
                              padding: 12,
                              border:
                                "none",
                              borderRadius: 8,
                              background:
                                "#667eea",
                              color:
                                "white",
                              fontWeight:
                                "bold",
                              cursor:
                                "pointer",
                            }}
                          >
                            Start Lesson →
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}