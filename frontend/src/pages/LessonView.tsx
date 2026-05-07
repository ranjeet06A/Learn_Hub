import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

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

  const [questions, setQuestions] =
    useState<any[]>([]);

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

  const [course, setCourse] =
    useState<Course | null>(null);

  const startTimeRef =
    useRef<number>(0);

  // ======================
  // LOAD COURSE + LESSON
  // ======================
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

      // ✅ FIXED FOR MONGODB
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

      // ✅ FIXED FOR MONGODB
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

      setQuestions([]);

      setLoading(false);
    } catch (err) {
      console.log(err);

      setLoading(false);
    }
  }, [courseId, lessonId]);

  // ======================
  // TIMER
  // ======================
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

  // ======================
  // ANSWER SELECT
  // ======================
  const handleSelect = (
    optionIndex: number
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ]: optionIndex,
    }));
  };

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async () => {
    if (!questions.length) return;

    let correct = 0;

    let wrong = 0;

    let attempted = 0;

    questions.forEach((q, i) => {
      const selected = answers[i];

      if (selected !== undefined) {
        attempted++;

        const correctAnswer =
          Number(q.correctIndex);

        if (
          selected === correctAnswer
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

    // TIME
    const endTime = Date.now();

    const safeStart =
      startTimeRef.current ||
      Date.now();

    const timeSpent = Math.max(
      1,
      Math.floor(
        (endTime - safeStart) /
          1000
      )
    );

    // DATE
    const now = new Date();

    const attemptTime =
      now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    const attemptDate =
      now.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    const result = {
      courseId,

      lessonId,

      quizIndex:
        selectedQuizIndex,

      total,

      correct,

      wrong,

      attempted,

      score,

      timeSpent,

      attemptTime,

      attemptDate,

      courseName:
        course?.title ||
        course?.name ||
        "Course",

      lessonName:
        lesson?.title ||
        lesson?.name ||
        "Lesson",
    };

    // LOCAL SAVE
    const oldResults =
      JSON.parse(
        localStorage.getItem(
          "learn_hub_progress"
        ) || "[]"
      );

    localStorage.setItem(
      "learn_hub_progress",
      JSON.stringify([
        ...oldResults,
        result,
      ])
    );

    // BACKEND SAVE
    try {
      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        "https://learn-hub-backend-g1pi.onrender.com/results",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(
            result
          ),
        }
      );
    } catch {
      console.warn(
        "Backend not available"
      );
    }

    navigate("/results");
  };

  // ======================
  // TIMER FORMAT
  // ======================
  const formatTime = () => {
    const min = Math.floor(
      timeLeft / 60
    );

    const sec = timeLeft % 60;

    return `${min}:${
      sec < 10 ? "0" : ""
    }${sec}`;
  };

  // ======================
  // LOADING
  // ======================
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

  const q = questions[currentQ];

  // ✅ SAFE QUIZZES
  const quizzes =
    lesson.quizzes ||
    lesson.quiz ||
    [];

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
          marginBottom: 30,
          background: "#fff",
          padding: 20,
          borderRadius: 10,
        }}
        dangerouslySetInnerHTML={{
          __html:
            lesson.content ||
            "<p style='color:red'>No content</p>",
        }}
      />

      {/* QUIZ SELECT */}
      {quizzes.length > 0 &&
        selectedQuizIndex ===
          null && (
          <div>
            <h3>Select Quiz</h3>

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
                      Array.isArray(
                        quiz
                      )
                        ? quiz
                        : []
                    );

                    setCurrentQ(0);

                    setAnswers({});

                    setTimeLeft(
                      quiz.length *
                        60
                    );

                    startTimeRef.current =
                      Date.now();
                  }}
                  style={{
                    display:
                      "block",

                    margin: 10,

                    background:
                      "#667eea",

                    color:
                      "white",

                    padding: 10,

                    borderRadius: 6,

                    border:
                      "none",

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

      {/* QUIZ */}
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
                marginBottom: 10,
              }}
            >
              ⏱{" "}
              {formatTime()}
            </div>

            {q && (
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

                {q.statements?.map(
                  (
                    s: string,
                    i: number
                  ) => (
                    <div key={i}>
                      {String.fromCharCode(
                        65 + i
                      )}
                      . {s}
                    </div>
                  )
                )}

                {q.options?.map(
                  (
                    opt: string,
                    i: number
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

                        margin: 6,

                        padding: 10,

                        width:
                          "100%",

                        borderRadius: 6,

                        border:
                          "1px solid #ccc",

                        background:
                          answers[
                            currentQ
                          ] === i
                            ? "#cce5ff"
                            : "#fff",

                        cursor:
                          "pointer",
                      }}
                    >
                      {opt}
                    </button>
                  )
                )}
              </>
            )}

            {/* NAV */}
            <div
              style={{
                marginTop: 10,
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