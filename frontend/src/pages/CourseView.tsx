import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Lesson = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  content?: string;
  quiz?: any[];
  quizzes?: any[];
};

type Course = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  lessons: Lesson[];
};

export default function CourseView() {
  // ✅ ROUTE PARAM
  const { courseId } = useParams();

  const navigate = useNavigate();

  const [course, setCourse] =
    useState<Course | null>(null);

  useEffect(() => {
    try {
      // ✅ LOAD COURSES
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

      // ✅ FIND COURSE USING _id OR id
      const found = courses.find(
        (c) =>
          String(c._id || c.id) ===
          String(courseId)
      );

      if (!found) {
        console.log(
          "❌ Course not found"
        );
        return;
      }

      console.log(
        "✅ FOUND COURSE:",
        found
      );

      // ✅ SAFE LESSONS
      setCourse({
        ...found,
        lessons: Array.isArray(
          found.lessons
        )
          ? found.lessons
          : [],
      });
    } catch (error) {
      console.error(
        "❌ Failed to load course:",
        error
      );
    }
  }, [courseId]);

  // ✅ NOT FOUND
  if (!course) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Course not found</h2>

        <button
          onClick={() =>
            navigate("/courses")
          }
          style={{
            padding: "10px 14px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            marginTop: 10,
          }}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>
        {course.title ||
          course.name}
      </h1>

      <p>
        📘 Lessons:{" "}
        {course.lessons.length}
      </p>

      {course.lessons.length ===
        0 && (
        <p>No lessons available</p>
      )}

      {course.lessons.map(
        (lesson) => (
          <div
            key={
              lesson._id ||
              lesson.id
            }
            style={{
              padding: 15,
              marginTop: 10,
              border:
                "1px solid #ccc",
              borderRadius: 6,
            }}
          >
            <h3>
              {lesson.title ||
                lesson.name}
            </h3>

            <button
              onClick={() => {
                console.log(
                  "OPENING LESSON:",
                  {
                    courseId:
                      course._id ||
                      course.id,

                    lessonId:
                      lesson._id ||
                      lesson.id,
                  }
                );

                navigate(
                  `/course/${
                    course._id ||
                    course.id
                  }/lesson/${
                    lesson._id ||
                    lesson.id
                  }`
                );
              }}
              style={{
                padding:
                  "8px 12px",
                background:
                  "#667eea",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
              }}
            >
              Open Lesson
            </button>
          </div>
        )
      )}
    </div>
  );
}