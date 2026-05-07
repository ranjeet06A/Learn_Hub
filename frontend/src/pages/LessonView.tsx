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

type Lesson = {
  _id?: string;
  id?: string;

  title?: string;
  name?: string;

  content?: string;

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

  const startTimeRef =
    useRef<number>(0);

  // =========================
  // LOAD COURSE + LESSON
  // =========================
  useEffect(() => {
    try {
      const courses: Course[] =
        JSON.parse(
          localStorage.getItem(
            "learn_hub_courses"
          ) || "[]"
        );

      console.log(
        "📚 COURSES:",
        courses
      );

      console.log(
        "🌐 URL courseId:",
        courseId
      );

      const foundCourse =
        courses.find(
          (c) =>
            String(c._id || c.id) ===
            String(courseId)
        );

      console.log(
        "✅ FOUND COURSE:",
        foundCourse
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

      console.log(
        "✅ FOUND LESSON:",
        foundLesson
      );

      if (!foundLesson) {
        setLoading(false);
        return;
      }

      setLesson(foundLesson);

      setLoading(false);
    } catch (err) {
      console.log(err);

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

    const result = {
      courseId,
      lessonId,

      total,
      correct,
      wrong,
      attempted,
      score,
      timeSpent,

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
    return <h3>Loading...</h3>;
  }

  if (!lesson) {
    return (
      <h3>
        ❌ Lesson not found
      </h3>
    );
  }

  // =========================
  // SAFE QUIZZES
  // =========================
  let quizzes: any[] = [];

  if (
    Array.isArray(lesson.quizzes)
  ) {
    quizzes = lesson.quizzes;
  } else if (
    Array.isArray(lesson.quiz)
  ) {
    quizzes = [lesson.quiz];
  }

  console.log(
    "🧠 QUIZZES:",
    quizzes
  );

  const q = questions[currentQ];

  return (
    <div style={{ padding: 20 }}>
      <h2>
        📘{" "}
        {lesson.title ||
          lesson.name}
      </h2>

      {/* CONTENT */}
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          marginBottom: 30,
        }}
        dangerouslySetInnerHTML={{
          __html:
            lesson.content ||
            "<p>No content</p>",
        }}
      />

      {/* QUIZ SELECT */}
      {selectedQuizIndex ===
        null &&
        quizzes.length > 0 && (
          <div>
            <h3>Select Quiz</h3>

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

                    let finalQuestions: Question[] =
  [];

console.log(
  "QUIZ JSON:",
  JSON.stringify(
    quiz,
    null,
    2
  )
);

// ✅ DIRECT ARRAY
if (Array.isArray(quiz)) {
  finalQuestions = quiz;
}

// ✅ quiz.questions
else if (
  Array.isArray(
    quiz.questions
  )
) {
  finalQuestions =
    quiz.questions;
}

// ✅ quiz.quiz
else if (
  Array.isArray(
    quiz.quiz
  )
) {
  finalQuestions =
    quiz.quiz;
}

// ✅ nested object
else if (
  quiz.questions &&
  Array.isArray(
    quiz.questions.questions
  )
) {
  finalQuestions =
    quiz.questions.questions;
}

// ✅ Mongo import format
else if (
  quiz.data &&
  Array.isArray(
    quiz.data
  )
) {
  finalQuestions =
    quiz.data;
}

// ✅ SINGLE QUESTION OBJECT
else if (
  quiz.questionTitle
) {
  finalQuestions = [quiz];
}

// ✅ LAST RESORT
else {
  for (const key in quiz) {
    if (
      Array.isArray(
        quiz[key]
      ) &&
      quiz[key].length > 0 &&
      quiz[key][0]
        ?.questionTitle
    ) {
      finalQuestions =
        quiz[key];

      break;
    }
  }
}

console.log(
  "FINAL QUESTIONS:",
  finalQuestions
);

if (
  !finalQuestions.length
) {
  alert(
    "Quiz format unsupported. Check console."
  );

  return;
}

                    console.log(
                      "FINAL QUESTIONS:",
                      finalQuestions
                    );

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
                  }}
                  style={{
                    display:
                      "block",
                    marginBottom: 10,
                    padding: 10,
                    background:
                      "#667eea",
                    color:
                      "white",
                    border:
                      "none",
                    borderRadius: 6,
                    cursor:
                      "pointer",
                  }}
                >
                  Quiz{" "}
                  {index + 1}
                </button>
              )
            )}
          </div>
        )}

      {/* QUIZ SCREEN */}
      {selectedQuizIndex !==
        null &&
        questions.length >
          0 && (
          <>
            <h3>
              📝 Quiz{" "}
              {selectedQuizIndex +
                1}
            </h3>

            <div
              style={{
                marginBottom: 15,
              }}
            >
              ⏱{" "}
              {formatTime()}
            </div>

            {q &&
              questions.length >
                0 && (
                <>
                  <h4>
                    Q
                    {currentQ +
                      1}
                    .{" "}
                    {
                      q.questionTitle
                    }
                  </h4>

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
                      marginTop: 20,
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
                              marginBottom: 10,
                              padding: 12,
                              borderRadius: 6,
                              border:
                                "1px solid #ccc",
                              cursor:
                                "pointer",
                              background:
                                answers[
                                  currentQ
                                ] ===
                                i
                                  ? "#cce5ff"
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

            {/* NAVIGATION */}
            <div
              style={{
                marginTop: 20,
                display: "flex",
                gap: 10,
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
  );
}