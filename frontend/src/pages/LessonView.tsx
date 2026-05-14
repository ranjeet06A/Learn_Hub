import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

type Question = {
  questionTitle?: string;
  statements?: string[];
  options?: string[];
  correctIndex?: number;
};

type LessonPage = {
  title?: string;
  content?: string;
};

type Lesson = {
  _id?: string;
  id?: string;

  title?: string;
  name?: string;

  content?: string;

  pages?: LessonPage[];

  quiz?: any[];
  quizzes?: any[];
};

type Course = {
  _id?: string;
  id?: string;

  title?: string;
  name?: string;

  lessons: Lesson[];
};

export default function LessonView() {
  const { courseId, lessonId } =
    useParams();

  const navigate = useNavigate();

  const [lesson, setLesson] =
    useState<Lesson | null>(null);

  const [course, setCourse] =
    useState<Course | null>(null);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [answers, setAnswers] =
    useState<{
      [key: number]: number;
    }>({});

  const [currentQ, setCurrentQ] =
    useState(0);

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [
    selectedQuizIndex,
    setSelectedQuizIndex,
  ] = useState<number | null>(null);

  // ✅ PAGE SYSTEM
  const [currentPage, setCurrentPage] =
    useState(0);

  const startTimeRef =
    useRef<number>(0);

  // =========================
  // LOAD COURSE + LESSON
  // =========================
  useEffect(() => {
    try {
      const storedCourses =
        localStorage.getItem(
          "learn_hub_courses"
        );

      const courses: Course[] =
        storedCourses
          ? JSON.parse(
              storedCourses
            )
          : [];

      const foundCourse =
        courses.find(
          (c) =>
            String(c._id || c.id) ===
            String(courseId)
        );

      if (!foundCourse) {
        setLoading(false);
        return;
      }

      setCourse(foundCourse);

      const foundLesson =
        foundCourse.lessons?.find(
          (l) =>
            String(l._id || l.id) ===
            String(lessonId)
        );

      if (!foundLesson) {
        setLoading(false);
        return;
      }

      setLesson(foundLesson);

      setLoading(false);
    } catch (err) {
      // silent error
      setLoading(false);
    }
  }, [courseId, lessonId]);

  // =========================
  // TIMER
  // =========================
  useEffect(() => {
    if (!timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          handleSubmit();

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [timeLeft]);

  // =========================
  // LESSON PAGES
  // =========================
  const lessonPages =
    lesson?.pages?.length
      ? lesson.pages
      : [
          {
            title:
              lesson?.title ||
              lesson?.name,
            content:
              lesson?.content ||
              "No Content",
          },
        ];

  const page =
    lessonPages[currentPage];

  // =========================
  // SELECT ANSWER
  // =========================
  const handleSelect = (
    optionIndex: number
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ]: optionIndex,
    }));
  };

  // =========================
  // SUBMIT QUIZ
  // =========================
  const handleSubmit = () => {
    if (!questions.length) return;

    let correct = 0;
    let wrong = 0;
    let attempted = 0;

    questions.forEach((q, i) => {
      const selected = answers[i];

      if (selected !== undefined) {
        attempted++;

        if (
          selected ===
          Number(q.correctIndex)
        ) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    const total =
      questions.length;

    const score =
      correct - wrong * 0.25;

    const endTime = Date.now();

    const timeSpent = Math.floor(
      (endTime -
        startTimeRef.current) /
        1000
    );

    const now = new Date();

    const result = {
      courseId,
      lessonId,

      quizIndex:
        selectedQuizIndex || 0,

      total,
      correct,
      wrong,
      attempted,
      score,

      timeSpent,

      attemptDate:
        now.toLocaleDateString(),

      attemptTime:
        now.toLocaleTimeString(),

      createdAt:
        now.toISOString(),

      courseName:
        course?.title ||
        course?.name,

      lessonName:
        lesson?.title ||
        lesson?.name,
    };

    const old =
      JSON.parse(
        localStorage.getItem(
          "learn_hub_progress"
        ) || "[]"
      );

    localStorage.setItem(
      "learn_hub_progress",
      JSON.stringify([
        ...old,
        result,
      ])
    );

    navigate("/results");
  };

  // =========================
  // FORMAT TIMER
  // =========================
  const formatTime = () => {
    const min = Math.floor(
      timeLeft / 60
    );

    const sec = timeLeft % 60;

    return `${min}:${
      sec < 10 ? "0" : ""
    }${sec}`;
  };

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
            borderTop:
              "5px solid #667eea",
            borderRadius: "50%",
            animation:
              "spin 1s linear infinite",
          }}
        />

        <p style={{ marginTop: 20 }}>
          Loading lesson...
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

  if (!lesson) {
    return (
      <h3>
        ❌ Lesson not found
      </h3>
    );
  }

  // =========================
// PROFESSIONAL QUIZ SYSTEM
// =========================

// ✅ LOAD QUIZZES FROM LOCAL STORAGE
const allQuizData = JSON.parse(
  localStorage.getItem("quizData") || "{}"
);

const lessonQuizData =
  allQuizData[lessonId || ""] || [];

let quizzes: any[] = [];

// =========================
// NEW PROFESSIONAL FORMAT
// [
//   {
//     title: "Quiz 1",
//     questions: []
//   }
// ]
// =========================
if (
  Array.isArray(lessonQuizData) &&
  lessonQuizData.length > 0
) {
  const firstItem =
    lessonQuizData[0];

  // ✅ PROFESSIONAL QUIZ SETS
  if (
    firstItem &&
    Array.isArray(
      firstItem.questions
    )
  ) {
    quizzes = lessonQuizData;
  }

  // ✅ OLD DIRECT QUESTIONS
  else if (
    firstItem &&
    firstItem.questionTitle
  ) {
    quizzes = [
      {
        title: "Quiz 1",
        questions:
          lessonQuizData,
      },
    ];
  }
}

// =========================
// FALLBACK TO LESSON DATA
// =========================
else if (
  Array.isArray(lesson.quizzes)
) {
  const firstItem =
    lesson.quizzes[0];

  if (
    firstItem &&
    Array.isArray(
      firstItem.questions
    )
  ) {
    quizzes =
      lesson.quizzes;
  }

  else if (
    firstItem &&
    firstItem.questionTitle
  ) {
    quizzes = [
      {
        title: "Quiz 1",
        questions:
          lesson.quizzes,
      },
    ];
  }
}

else if (
  Array.isArray(lesson.quiz)
) {
  const firstItem =
    lesson.quiz[0];

  if (
    firstItem &&
    firstItem.questionTitle
  ) {
    quizzes = [
      {
        title: "Quiz 1",
        questions:
          lesson.quiz,
      },
    ];
  }
}

const q = questions[currentQ];

  return (
    <div
      style={{
        background: "#f3f4f6",
        minHeight: "100vh",
        padding:
          window.innerWidth < 768
            ? 12
            : 20,
      }}
    >
      {/* LESSON CONTAINER */}
      <div
        style={{
          maxWidth: "950px",
          margin: "0 auto",
          background: "white",
          borderRadius: 12,
          padding:
            window.innerWidth < 768
              ? 16
              : 30,
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        {/* TOP BAR */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 15,
          }}
        >
          <div>
            <h1>
              📘{" "}
              {lesson.title ||
                lesson.name}
            </h1>

            <p>
              Page{" "}
              {currentPage + 1} of{" "}
              {lessonPages.length}
            </p>
          </div>

          {/* QUIZ BUTTONS */}
          {selectedQuizIndex ===
            null &&
            quizzes.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  width: "100%",
                  justifyContent:
                    window.innerWidth <
                    768
                      ? "center"
                      : "flex-end",
                }}
              >
                {quizzes.map(
                  (
                    quiz,
                    index
                  ) => (
                    <button
                      key={index}
                      onClick={() => {
                        let finalQuestions: Question[] =
                          [];

                        if (
                          Array.isArray(
                            quiz
                          )
                        ) {
                          finalQuestions =
                            quiz;
                        } else if (
                          Array.isArray(
                            quiz.questions
                          )
                        ) {
                          finalQuestions =
                            quiz.questions;
                        } else if (
                          Array.isArray(
                            quiz.quiz
                          )
                        ) {
                          finalQuestions =
                            quiz.quiz;
                        } else if (
                          quiz.questions &&
                          Array.isArray(
                            quiz.questions
                              .questions
                          )
                        ) {
                          finalQuestions =
                            quiz.questions.questions;
                        } else if (
                          quiz.data &&
                          Array.isArray(
                            quiz.data
                          )
                        ) {
                          finalQuestions =
                            quiz.data;
                        } else if (
                          quiz.questionTitle
                        ) {
                          finalQuestions =
                            [quiz];
                        }

                        if (
                          !finalQuestions.length
                        ) {
                          alert(
                            "Quiz format unsupported."
                          );

                          return;
                        }

                        setSelectedQuizIndex(
                          index
                        );

                        setQuestions(
                          finalQuestions
                        );

                        setCurrentQ(0);

                        setAnswers({});

                        setTimeLeft(
                          finalQuestions.length *
                            60
                        );

                        startTimeRef.current =
                          Date.now();

                        window.scrollTo({
                          top: 0,
                          behavior:
                            "smooth",
                        });
                      }}
                      style={{
                        padding:
                          "12px 18px",
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
                      }}
                    >
                      📝 {quiz.title || `Quiz ${index + 1}`}
                    </button>
                  )
                )}
              </div>
            )}
        </div>

        {/* PROGRESS BAR */}
        <div
          style={{
            width: "100%",
            height: 8,
            background:
              "#e5e7eb",
            borderRadius: 20,
            overflow: "hidden",
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: `${
                ((currentPage + 1) /
                  lessonPages.length) *
                100
              }%`,
              height: "100%",
              background:
                "#667eea",
            }}
          />
        </div>

        {/* LESSON CONTENT */}
        {selectedQuizIndex ===
          null && (
          <>
            <div
              style={{
                minHeight: 350,
              }}
            >
              <h2>
                {page?.title}
              </h2>

              <div
                style={{
                  marginTop: 20,
                  lineHeight: 1.8,
                  fontSize:
                    window.innerWidth <
                    768
                      ? 15
                      : 17,
                  overflowX: "auto",
                  wordBreak:
                    "break-word",
                }}
              >
                <style>
                  {`
                    .lesson-content table {
                      width: 100%;
                      border-collapse: collapse;
                      display: block;
                      overflow-x: auto;
                      white-space: nowrap;
                    }

                    .lesson-content th,
                    .lesson-content td {
                      border: 1px solid #ccc;
                      padding: 10px;
                      text-align: left;
                    }

                    .lesson-content img {
                      max-width: 100%;
                      height: auto;
                    }

                    .lesson-content iframe {
                      max-width: 100%;
                    }

                    .lesson-content pre {
                      overflow-x: auto;
                      background: #f3f4f6;
                      padding: 10px;
                      border-radius: 6px;
                    }

                    .lesson-content {
                      overflow-x: auto;
                    }
                  `}
                </style>

                <div
                  className="lesson-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      page?.content ||
                      "<p>No Content</p>",
                  }}
                />
              </div>
            </div>

            {/* PAGE NAVIGATION */}
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginTop: 40,
                gap: 10,
              }}
            >
              <button
                disabled={
                  currentPage === 0
                }
                onClick={() =>
                  setCurrentPage(
                    currentPage - 1
                  )
                }
                style={{
                  padding:
                    "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    currentPage === 0
                      ? "#d1d5db"
                      : "#111827",
                  color: "white",
                  cursor:
                    currentPage === 0
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                ← Previous
              </button>

              {currentPage <
              lessonPages.length -
                1 ? (
                <button
                  onClick={() =>
                    setCurrentPage(
                      currentPage + 1
                    )
                  }
                  style={{
                    padding:
                      "12px 20px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      "#667eea",
                    color: "white",
                    cursor:
                      "pointer",
                  }}
                >
                  Next →
                </button>
              ) : (
                <button
                  style={{
                    padding:
                      "12px 20px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      "#16a34a",
                    color: "white",
                    fontWeight:
                      "bold",
                  }}
                >
                  ✅ Lesson Complete
                </button>
              )}
            </div>
          </>
        )}

        {/* QUIZ SCREEN */}
        {selectedQuizIndex !==
          null &&
          questions.length >
            0 && (
            <>
              <h2>
  📝 {
    quizzes[selectedQuizIndex]
      ?.title ||
    `Quiz ${selectedQuizIndex + 1}`
  }
</h2>

              <div
                style={{
                  marginBottom: 20,
                  fontWeight:
                    "bold",
                  color: "red",
                }}
              >
                ⏱{" "}
                {formatTime()}
              </div>

              {q && (
                <>
                  <h3>
                    Q
                    {currentQ + 1}
                    .{" "}
                    {
                      q.questionTitle
                    }
                  </h3>

                  {Array.isArray(
                    q.statements
                  ) &&
                    q.statements.map(
                      (
                        s,
                        i
                      ) => (
                        <div
                          key={i}
                          style={{
                            marginTop: 5,
                          }}
                        >
                          {
                            String.fromCharCode(
                              65 +
                                i
                            )
                          }
                          . {s}
                        </div>
                      )
                    )}

                  <div
                    style={{
                      marginTop: 25,
                    }}
                  >
                    {Array.isArray(
                      q.options
                    ) &&
                      q.options.map(
                        (
                          opt,
                          i
                        ) => (
                          <button
                            key={i}
                            onClick={() =>
                              handleSelect(
                                i
                              )
                            }
                            style={{
                              display:
                                "block",
                              width:
                                "100%",
                              textAlign:
                                "left",
                              marginBottom: 12,
                              padding: 15,
                              borderRadius: 8,
                              border:
                                "1px solid #ccc",
                              cursor:
                                "pointer",
                              fontSize: 16,
                              background:
                                answers[
                                  currentQ
                                ] ===
                                i
                                  ? "#dbeafe"
                                  : "white",
                            }}
                          >
                            {opt}
                          </button>
                        )
                      )}
                  </div>
                </>
              )}

              {/* QUIZ NAVIGATION */}
              <div
                style={{
                  marginTop: 30,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <button
                  disabled={
                    currentQ === 0
                  }
                  onClick={() =>
                    setCurrentQ(
                      (p) =>
                        p - 1
                    )
                  }
                >
                  Prev
                </button>

                <button
                  disabled={
                    currentQ ===
                    questions.length -
                      1
                  }
                  onClick={() =>
                    setCurrentQ(
                      (p) =>
                        p + 1
                    )
                  }
                >
                  Next
                </button>

                <button
                  onClick={
                    handleSubmit
                  }
                >
                  Submit
                </button>
              </div>
            </>
          )}
      </div>
    </div>
  );
}