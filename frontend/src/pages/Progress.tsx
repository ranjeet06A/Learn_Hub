import api from "../utils/api"; // ✅ FIXED
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Progress() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");

        // 🔐 NOT LOGGED IN
        if (!token) {
          navigate("/login");
          return;
        }

        // ✅ USING API HELPER
        const backendData = await api.get("/results");

        if (Array.isArray(backendData)) {
          setData(backendData);
        }
      } catch (err) {
        console.log("Backend failed, using localStorage");
      }

      // 🔥 FALLBACK (UNCHANGED)
      const stored = JSON.parse(
       
      );
      setData(Array.isArray(stored) ? stored : []);

      const user = JSON.parse(
        localStorage.getItem("learn_hub_user") || "{}"
      );

      const enrollments = JSON.parse(
        localStorage.getItem("enrollments") || "[]"
      );

      const allCourses = JSON.parse(
        localStorage.getItem("learn_hub_courses") || "[]"
      );

      setCourses(allCourses);

      const enrolledCourses = enrollments
        .filter((e: any) => e.user === user.email)
        .map((e: any) =>
          allCourses.find((c: any) => c.id === e.courseId)
        )
        .filter(Boolean);

      setMyCourses(enrolledCourses);
    };

    loadData();
  }, [navigate]);

  // ======================
  // HELPERS (UNCHANGED)
  // ======================
  const getCourseName = (courseId: string) => {
    const c = courses.find((c: any) => String(c.id) === String(courseId));
    return c?.title || c?.name;
  };

  const getLessonName = (courseId: string, lessonId: string) => {
    const c = courses.find((c: any) => String(c.id) === String(courseId));
    const l = c?.lessons?.find((l: any) => String(l.id) === String(lessonId));
    return l?.title || l?.name;
  };

  // ======================
  // SUMMARY (UNCHANGED)
  // ======================
  const totalLessons = data.length;
  const totalScore = data.reduce((sum, d) => sum + (d.score || 0), 0);
  const avgScore = totalScore / (totalLessons || 1);
  const totalTime = data.reduce((sum, d) => sum + (d.timeSpent || 0), 0);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  // ======================
  // GROUPING (UNCHANGED)
  // ======================
  const grouped: any = {};

  data.forEach((r) => {
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
    <div style={{ padding: 20 }}>
      <h2>📊 Your Learning Progress</h2>

      {/* ENROLLED COURSES */}
      <h3 style={{ marginTop: 20 }}>📚 Enrolled Courses</h3>

      {myCourses.length === 0 ? (
        <p>No enrolled courses</p>
      ) : (
        myCourses.map((course) => (
          <div
            key={course.id}
            style={{
              border: "1px solid #ddd",
              padding: 10,
              marginTop: 10,
              borderRadius: 6,
            }}
          >
            <h4>{course.title}</h4>
            <p>Lessons: {course.lessons?.length || 0}</p>
          </div>
        ))
      )}

      {/* STRUCTURED PROGRESS */}
      <h3 style={{ marginTop: 30 }}>📂 Structured Progress</h3>

      {Object.keys(grouped).map((course) => (
        <div key={course} style={{ marginTop: 20 }}>
          <h4>📘 {course}</h4>

          {Object.keys(grouped[course]).map((lesson) => (
            <div key={lesson} style={{ marginLeft: 20 }}>
              <p>📖 {lesson}</p>

              {Object.keys(grouped[course][lesson]).map((quiz) => (
                <div key={quiz} style={{ marginLeft: 20 }}>
                  <p>📝 Quiz {Number(quiz) + 1}</p>

                  {grouped[course][lesson][quiz].map(
                    (r: any, i: number) => (
                      <div key={i}>
                        Attempt {i + 1} → Score: {r.score} | ⏱{" "}
                        {formatTime(r.timeSpent || 0)}
                        <br />
                        📅 {r.attemptDate || "N/A"} | 🕒{" "}
                        {r.attemptTime || "N/A"}
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {/* SUMMARY */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div>
          <h3>Lessons Completed</h3>
          <p>{totalLessons}</p>
        </div>

        <div>
          <h3>Average Score</h3>
          <p>{avgScore.toFixed(2)}</p>
        </div>

        <div>
          <h3>Total Time</h3>
          <p>{formatTime(totalTime)}</p>
        </div>
      </div>
    </div>
  );
}