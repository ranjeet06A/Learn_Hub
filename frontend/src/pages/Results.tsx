import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// helper data
const courses = JSON.parse(
  localStorage.getItem("learn_hub_courses") || "[]"
);

const getCourseName = (courseId: string) => {
  const c = courses.find((c: any) => String(c.id) === String(courseId));
  return c?.title || c?.name;
};

const getLessonName = (courseId: string, lessonId: string) => {
  const c = courses.find((c: any) => String(c.id) === String(courseId));
  const l = c?.lessons?.find((l: any) => String(l.id) === String(lessonId));
  return l?.title || l?.name;
};

export default function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:5000/results", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
// 🔥 AUTO LOGOUT IF TOKEN EXPIRED
if (res.status === 401) {
  alert("Session expired. Please login again.");
  localStorage.removeItem("token");
  navigate("/login");
  return;
}
        // ✅ 🔥 CRITICAL FIX (AUTO LOGOUT)
        if (res.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (res.ok) {
          const data = await res.json();

          if (data.length > 0) {
            setResults(data);
            return;
          }
        }
      } catch (err) {
        console.log("Backend failed, using localStorage");
      }

      const stored = JSON.parse(
        localStorage.getItem("learn_hub_progress") || "[]"
      );

      setResults(stored);
    };

    loadResults();
  }, [navigate]);

  if (!results.length) {
    return (
      <div style={{ padding: 30, textAlign: "center" }}>
        <h2>No result found</h2>
        <button onClick={() => navigate("/")}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  const grouped: any = {};

  results.forEach((r) => {
    const course =
      r.courseName ||
      getCourseName(r.courseId) ||
      "Unknown Course";

    const lesson =
      r.lessonName ||
      getLessonName(r.courseId, r.lessonId) ||
      r.lessonId ||
      "Lesson";

    const quiz = r.quizIndex ?? 0;

    if (!grouped[course]) grouped[course] = {};
    if (!grouped[course][lesson]) grouped[course][lesson] = {};
    if (!grouped[course][lesson][quiz])
      grouped[course][lesson][quiz] = [];

    grouped[course][lesson][quiz].push(r);
  });

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ textAlign: "center" }}>📊 Quiz Results</h1>

      {Object.keys(grouped).map((course) => (
        <div key={course} style={{ marginTop: 30 }}>
          <h2>📘 {course}</h2>

          {Object.keys(grouped[course]).map((lesson) => (
            <div key={lesson} style={{ marginLeft: 20 }}>
              <h3>📖 {lesson}</h3>

              {Object.keys(grouped[course][lesson]).map((quiz) => (
                <div key={quiz} style={{ marginLeft: 20 }}>
                  <h4>📝 Quiz {Number(quiz) + 1}</h4>

                  {grouped[course][lesson][quiz].map(
                    (r: any, index: number) => {
                      const total = r.total ?? 0;
                      const score = r.score ?? 0;
                      const correct = r.correct ?? 0;
                      const wrong = r.wrong ?? 0;

                      const percentage =
                        total > 0 ? (score / total) * 100 : 0;

                      const attemptDate = r.attemptDate || "N/A";
                      const attemptTime = r.attemptTime || "N/A";

                      const timeSpent =
                        typeof r.timeSpent === "number"
                          ? r.timeSpent
                          : 0;

                      const formatTime = (sec: number) => {
                        const m = Math.floor(sec / 60);
                        const s = sec % 60;
                        return `${m}m ${s}s`;
                      };

                      return (
                        <div
                          key={index}
                          style={{
                            border: "1px solid #ccc",
                            marginBottom: 10,
                            padding: 15,
                            borderRadius: 8,
                          }}
                        >
                          <strong>Attempt {index + 1}</strong>

                          <p>📅 Date: {attemptDate}</p>
                          <p>🕒 Time: {attemptTime}</p>
                          <p>⏱ Duration: {formatTime(timeSpent)}</p>

                          <p>Score: {score}</p>
                          <p>Correct: {correct}</p>
                          <p>Wrong: {wrong}</p>

                          <p>
                            Percentage: {percentage.toFixed(2)}%
                          </p>

                          <p
                            style={{
                              fontWeight: "bold",
                              color:
                                percentage >= 40
                                  ? "green"
                                  : "red",
                            }}
                          >
                            {percentage >= 40
                              ? "✅ Passed"
                              : "❌ Failed"}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <div style={{ textAlign: "center", marginTop: 30 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            background: "#667eea",
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