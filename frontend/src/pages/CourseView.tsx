import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Lesson = {
  id: string;
  name?: string;
  title?: string;
  content?: string;
};

type Course = {
  id: string;
  name?: string;
  title?: string;
  lessons: Lesson[];
};

export default function CourseView() {
  const { courseId } = useParams(); // ✅ FIXED
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("learn_hub_courses");
    const courses: Course[] = stored ? JSON.parse(stored) : [];

    console.log("📚 COURSES:", courses);
    console.log("🌐 URL courseId:", courseId);

    const found = courses.find(
      (c) => String(c.id) === String(courseId) // ✅ FIXED
    );

    if (!found) {
      console.log("❌ Course not found");
      return;
    }

    console.log("✅ FOUND COURSE:", found);
    setCourse(found);
  }, [courseId]);

  if (!course) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Course not found</h2>
        <button onClick={() => navigate("/courses")}>
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>{course.title || course.name}</h1>

      <p>📘 Lessons: {course.lessons?.length || 0}</p>

      {course.lessons.length === 0 && (
        <p>No lessons available</p>
      )}

      {course.lessons.map((lesson) => (
        <div
          key={lesson.id}
          style={{
            padding: 15,
            marginTop: 10,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          <h3>{lesson.title || lesson.name}</h3>

          <button
            onClick={() =>
              navigate(`/course/${courseId}/lesson/${lesson.id}`) // ✅ FIXED
            }
            style={{
              padding: "8px 12px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            Open Lesson
          </button>
        </div>
      ))}
    </div>
  );
}