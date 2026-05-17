
import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

const API =
  "https://learn-hub-backend.onrender.com";

// ================= TYPES =================

type Question = {
  questionTitle?: string;
  question?: string;

  statements?: string[];

  options?: string[];

  correctIndex?: number;
};

type Quiz = {
  _id?: string;

  title?: string;

  questions?: any;
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

  quizzes?: Quiz[];
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

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [
    selectedQuizIndex,
    setSelectedQuizIndex,
  ] = useState<number | null>(null);

  const [currentPage, setCurrentPage] =
    useState(0);

  const startTimeRef =
    useRef<number>(0);

  // =========================
  // SAFE QUESTION PARSER
  // =========================

  const parseQuestions = (
  rawQuestions: any
): Question[] => {
  try {
    console.log(
      "RAW QUESTIONS INPUT:",
      rawQuestions
    );

    // =========================
    // CASE 1: NORMAL ARRAY
    // =========================

    if (Array.isArray(rawQuestions)) {
      // FIX NESTED ARRAY
      const flatQuestions =
        rawQuestions.flat
          ? rawQuestions.flat()
          : rawQuestions;

      const cleaned =
        flatQuestions.filter(
          (q: any) =>
            q &&
            typeof q ===
              "object" &&
            (
              q.questionTitle ||
              q.question
            ) &&
            Array.isArray(
              q.options
            )
        );

      console.log(
        "PARSED ARRAY QUESTIONS:",
        cleaned
      );

      return cleaned;
    }

    // =========================
    // CASE 2: STRINGIFIED JSON
    // =========================

    if (
      typeof rawQuestions ===
      "string"
    ) {
      const parsed =
        JSON.parse(rawQuestions);

      if (
        Array.isArray(parsed)
      ) {
        const cleaned =
          parsed.filter(
            (q: any) =>
              q &&
              typeof q ===
                "object" &&
              (
                q.questionTitle ||
                q.question
              ) &&
              Array.isArray(
                q.options
              )
          );

        console.log(
          "PARSED STRING QUESTIONS:",
          cleaned
        );

        return cleaned;
      }
    }

    // =========================
    // CASE 3: OBJECT WITH QUESTIONS
    // =========================

    if (
      rawQuestions &&
      typeof rawQuestions ===
        "object"
    ) {
      if (
        Array.isArray(
          rawQuestions.questions
        )
      ) {
        const cleaned =
          rawQuestions.questions.filter(
            (q: any) =>
              q &&
              typeof q ===
                "object" &&
              (
                q.questionTitle ||
                q.question
              ) &&
              Array.isArray(
                q.options
              )
          );

        console.log(
          "PARSED OBJECT QUESTIONS:",
          cleaned
        );

        return cleaned;
      }
    }

    console.log(
      "NO VALID QUESTIONS FOUND"
    );

    return [];
  } catch (err) {
    console.log(
      "QUESTION PARSE ERROR:",
      err
    );

    return [];
  }
};

  // =========================
  // LOAD LESSON
  // =========================

  useEffect(() => {
    const loadLesson =
      async () => {
        try {
          const response =
            await fetch(
              `${API}/courses`
            );

          const courses =
            await response.json();

          console.log(
            "BACKEND COURSES:",
            courses
          );

          const foundCourse =
            courses.find(
              (c: Course) =>
                String(
                  c._id || c.id
                ) ===
                String(courseId)
            );

          console.log(
            "FOUND COURSE:",
            foundCourse
          );

          if (!foundCourse) {
            setLoading(false);
            return;
          }

          setCourse(foundCourse);

          const foundLesson =
            foundCourse.lessons?.find(
              (l: Lesson) =>
                String(
                  l._id || l.id
                ) ===
                String(lessonId)
            );

          console.log(
            "FOUND LESSON:",
            foundLesson
          );

          if (!foundLesson) {
            setLoading(false);
            return;
          }

          // CLEAN QUIZZES HERE

          const cleanedQuizzes =
            Array.isArray(
              foundLesson.quizzes
            )
              ? foundLesson.quizzes.map(
                  (
                    quiz: any,
                    index: number
                  ) => {
                    const cleanedQuestions =
                      parseQuestions(
                        quiz.questions
                      );

                    console.log(
                      "CLEANED QUESTIONS:",
                      cleanedQuestions
                    );

                    return {
                      ...quiz,

                      title:
                        quiz.title ||
                        `Quiz ${
                          index + 1
                        }`,

                      questions:
                        cleanedQuestions,
                    };
                  }
                )
              : [];

          foundLesson.quizzes =
            cleanedQuizzes;

          console.log(
            "FINAL QUIZZES:",
            cleanedQuizzes
          );

          setLesson(foundLesson);

          setLoading(false);
        } catch (err) {
          console.log(
            "LOAD ERROR:",
            err
          );

          setLoading(false);
        }
      };

    loadLesson();
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
  // QUIZZES
  // =========================

  const quizzes: Quiz[] =
    Array.isArray(
      lesson?.quizzes
    )
      ? lesson.quizzes
      : [];

  console.log(
    "QUIZZES:",
    quizzes
  );

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
  // TIMER FORMAT
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
        }}
      >
        Loading...
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

  return (
    <div
      style={{
        background: "#f3f4f6",
        minHeight: "100vh",
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: "950px",
          margin: "0 auto",
          background: "white",
          borderRadius: 12,
          padding: 30,
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            marginBottom: 20,
          }}
        >
          <h1>
            📘 {lesson.title ||
              lesson.name}
          </h1>

          <p>
            Page {currentPage + 1} of{" "}
            {lessonPages.length}
          </p>
        </div>

        {/* QUIZ BUTTONS */}

        {quizzes.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 30,
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
                    console.log(
                      "SELECTED QUIZ:",
                      quiz
                    );

                    const finalQuestions =
                      parseQuestions(
                        quiz.questions
                      );

                    console.log(
                      "FINAL QUESTIONS:",
                      finalQuestions
                    );

                    if (
                      finalQuestions.length ===
                      0
                    ) {
                      alert(
                        "Quiz has no questions."
                      );

                      return;
                    }

                    setSelectedQuizIndex(
                      index
                    );

                    setQuestions(
                      finalQuestions
                    );

                    setAnswers({});

                    startTimeRef.current =
                      Date.now();

                    setTimeLeft(
                      finalQuestions.length *
                        120
                    );
                  }}
                  style={{
                    padding:
                      "12px 18px",
                    border: "none",
                    borderRadius: 10,
                    background:
                      "#667eea",
                    color: "white",
                    cursor:
                      "pointer",
                    fontWeight: 600,
                  }}
                >
                  📝 {quiz.title ||
                    `Quiz ${
                      index + 1
                    }`}
                </button>
              )
            )}
          </div>
        )}

        {/* LESSON CONTENT */}

        {selectedQuizIndex ===
          null && (
          <div>
            <h2>
              {page?.title}
            </h2>

            <div
              style={{
                marginTop: 20,
                lineHeight: 1.8,
              }}
              dangerouslySetInnerHTML={{
                __html:
                  page?.content ||
                  "",
              }}
            />
          </div>
        )}

        {/* QUIZ */}

        {selectedQuizIndex !==
          null && (
          <div>
            <div
              style={{
                fontSize: 24,
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
                question,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    marginBottom: 40,
                    padding: 20,
                    border:
                      "1px solid #ddd",
                    borderRadius: 10,
                  }}
                >
                  <h2>
                    Q
                    {index + 1}.{" "}
                    {question.questionTitle ||
                      question.question}
                  </h2>

                  {Array.isArray(
                    question.statements
                  ) &&
                    question.statements.map(
                      (
                        s,
                        i
                      ) => (
                        <div
                          key={i}
                          style={{
                            marginBottom: 10,
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
                      marginTop: 20,
                    }}
                  >
                    {Array.isArray(
                      question.options
                    ) &&
                      question.options.map(
                        (
                          opt,
                          optIndex
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
                              display:
                                "block",
                              width:
                                "100%",
                              textAlign:
                                "left",
                              marginBottom: 10,
                              padding: 14,
                              borderRadius: 10,
                              border:
                                answers[
                                  index
                                ] ===
                                optIndex
                                  ? "2px solid #4338ca"
                                  : "1px solid #ccc",
                              background:
                                answers[
                                  index
                                ] ===
                                optIndex
                                  ? "#eef2ff"
                                  : "white",
                              cursor:
                                "pointer",
                            }}
                          >
                            {opt}
                          </button>
                        )
                      )}
                  </div>
                </div>
              )
            )}

            <button
              onClick={handleSubmit}
              style={{
                padding:
                  "14px 24px",
                border: "none",
                borderRadius: 10,
                background:
                  "#4338ca",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Submit Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}