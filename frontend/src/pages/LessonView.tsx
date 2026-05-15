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
  questionIndex: number,
  optionIndex: number
) => {
  setAnswers((prev) => ({
    ...prev,
    [questionIndex]:
      optionIndex,
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
// QUIZ SYSTEM
// =========================

let quizzes: any[] = [];

// ✅ LOAD FROM IMPORTED quizData
try {
  const allQuizData =
    JSON.parse(
      localStorage.getItem(
        "quizData"
      ) || "{}"
    );

  quizzes =
    allQuizData[
      String(lessonId)
    ] || [];

  console.log(
    "QUIZZES FROM quizData:",
    quizzes
  );
} catch (err) {
  console.log(
    "Quiz loading error:",
    err
  );
}

// ✅ SAFETY FIX
quizzes = quizzes.map(
  (quiz: any, index: number) => ({
    title:
      quiz?.title ||
      `Quiz ${index + 1}`,

    questions:
      Array.isArray(
        quiz?.questions
      )
        ? quiz.questions
        : [],
  })
);

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
    </div>

    {/* QUIZ BUTTONS */}
    {Array.isArray(quizzes) &&
      quizzes.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 20,
            marginBottom: 30,
            justifyContent:
              "center",
          }}
        >
          {quizzes.map(
            (
              quiz: any,
              index: number
            ) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedQuizIndex(
                    index
                  );

                  setQuestions(
                    quiz.questions ||
                      []
                  );

                  setAnswers({});

                  setCurrentQ(0);

                  startTimeRef.current =
                    Date.now();

                  setTimeLeft(
                    (quiz.questions
                      ?.length ||
                      1) * 120
                  );
                }}
                style={{
                  padding:
                    "12px 18px",
                  border: "none",
                  borderRadius: 10,
                  background:
                    selectedQuizIndex ===
                    index
                      ? "#4338ca"
                      : "#667eea",
                  color: "white",
                  cursor:
                    "pointer",
                  fontWeight: 600,
                }}
              >
                📝{" "}
                {quiz.title ||
                  `Quiz ${
                    index + 1
                  }`}
              </button>
            )
          )}
        </div>
      )}

    {/* PROGRESS BAR */}
    <div
      style={{
        width: "100%",
        height: 8,
        background: "#e5e7eb",
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
          background: "#667eea",
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
          <h2>{page?.title}</h2>

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
      </>
    )}

    {/* QUIZ SCREEN */}
    {selectedQuizIndex !==
      null &&
      questions.length > 0 && (
        <div
          style={{
            marginTop: 30,
          }}
        >
          {/* TIMER */}
          <div
            style={{
              fontSize: 22,
              fontWeight:
                "bold",
              color: "red",
              marginBottom: 25,
            }}
          >
            ⏰ {formatTime()}
          </div>

         {questions.map(
  (
    question: any,
    index: number
  ) => {
    console.log(
      "QUESTION OBJECT:",
      question
    );

    return (
      <div
        key={index}
        style={{
          marginBottom: 40,
          padding: 20,
          borderRadius: 12,
          background: "#fff",
          border:
            "1px solid #ddd",
        }}
      >
        <h2
          style={{
            fontSize: 30,
            marginBottom: 20,
          }}
        >
          Q{index + 1}.{" "}
          {question?.questionTitle}
        </h2>

        {Array.isArray(
          question?.statements
        ) &&
          question.statements.map(
            (
              s: string,
              i: number
            ) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  fontSize: 18,
                }}
              >
                <strong>
                  {String.fromCharCode(
                    65 + i
                  )}
                  .
                </strong>{" "}
                {s}
              </div>
            )
          )}

        <div
          style={{
            marginTop: 25,
          }}
        >
          {Array.isArray(
            question?.options
          ) &&
            question.options.map(
              (
                opt: string,
                optIndex: number
              ) => (
                <button
                  key={optIndex}
                  onClick={() =>
                    handleSelect(
                      index,
                      optIndex
                    )
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign:
                      "left",
                    marginBottom: 12,
                    padding: 15,
                    borderRadius: 10,
                    border:
                      answers[
                        index
                      ] === optIndex
                        ? "2px solid #4338ca"
                        : "1px solid #ccc",
                    background:
                      answers[
                        index
                      ] === optIndex
                        ? "#eef2ff"
                        : "white",
                    cursor:
                      "pointer",
                    fontSize: 16,
                  }}
                >
                  {opt}
                </button>
              )
            )}
        </div>
      </div>
    );
  }
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
                  (p) => p - 1
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
                  (p) => p + 1
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
        </div>
      )}
    </div>
  </div>
);
}