import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [exams, setExams] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        // ✅ BACKEND FETCH
        const res = await fetch(
          "https://learn-hub-backend-g1pi.onrender.com/courses"
        );

        const backendData = await res.json();

        console.log(
          "RAW BACKEND DATA:",
          backendData
        );

        // ✅ SAFE ARRAY
        const finalCourses = Array.isArray(
          backendData
        )
          ? backendData
          : [];

        console.log(
          "FINAL COURSES ARRAY:",
          finalCourses
        );

        // ✅ SAVE LOCAL CACHE
        localStorage.setItem(
          "learn_hub_courses",
          JSON.stringify(finalCourses)
        );

        // ✅ SET COURSES
        setCourses(finalCourses);

        // ✅ EXTRACT EXAMS
        const extractedExams = Array.from(
          new Set(
            finalCourses
              .map((course: any) =>
                String(
                  course.examId ||
                    course.exam ||
                    course.examName ||
                    ""
                ).trim()
              )
              .filter(
                (e: string) =>
                  e.length > 0
              )
          )
        );

        setExams(
          extractedExams as string[]
        );

        console.log(
          "EXAMS:",
          extractedExams
        );

        // ✅ RESTORE SAVED EXAM
        const savedExam =
          localStorage.getItem(
            "selected_exam"
          ) || "";

        if (
          extractedExams.includes(savedExam)
        ) {
          setSelectedExam(savedExam);
        }
      } catch (err) {
        console.log(
          "Backend failed, using localStorage"
        );

        // ✅ FALLBACK LOCAL
        const localCourses = JSON.parse(
          localStorage.getItem(
            "learn_hub_courses"
          ) || "[]"
        );

        setCourses(localCourses);

        const extractedExams = Array.from(
          new Set(
            localCourses
              .map((course: any) =>
                String(
                  course.examId ||
                    course.exam ||
                    course.examName ||
                    ""
                ).trim()
              )
              .filter(
                (e: string) =>
                  e.length > 0
              )
          )
        );

        setExams(
          extractedExams as string[]
        );
      }
    };

    loadCourses();
  }, []);

  // ✅ FILTER COURSES
  const filteredCourses = selectedExam
    ? courses.filter((c: any) => {
        const examValue =
          c.examId ||
          c.exam ||
          c.examName ||
          "";

        return (
          String(examValue).trim() ===
          String(selectedExam).trim()
        );
      })
    : courses;

  return (
    <div style={{ padding: 30 }}>
      <h1>📚 Available Courses</h1>

      {/* EXAM FILTER */}
      <select
        value={selectedExam}
        onChange={(e) => {
          const value = e.target.value;

          setSelectedExam(value);

          localStorage.setItem(
            "selected_exam",
            value
          );
        }}
        style={{
          padding: 10,
          marginBottom: 20,
          minWidth: 250,
        }}
      >
        <option value="">
          All Exams
        </option>

        {exams.map((exam, i) => (
          <option key={i} value={exam}>
            {exam}
          </option>
        ))}
      </select>

      {/* EMPTY */}
      {filteredCourses.length === 0 && (
        <p>No courses found</p>
      )}

      {/* COURSES */}
      {filteredCourses.map(
        (course: any) => (
          <div
            key={course.id}
            style={{
              border:
                "1px solid #ccc",
              padding: 20,
              marginBottom: 15,
              borderRadius: 8,
            }}
          >
            <h2>
              {course.title ||
                course.name}
            </h2>

            <p>
              Exam:{" "}
              {course.examId ||
                course.exam ||
                course.examName}
            </p>

            <p>
              Lessons:{" "}
              {course.lessons
                ?.length || 0}
            </p>

            <button
              onClick={() =>
                navigate(
                  `/course/${course.id}`
                )
              }
            >
              Open Course
            </button>
          </div>
        )
      )}
    </div>
  );
}