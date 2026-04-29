import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const navigate = useNavigate();

  const loadCourses = async () => {
    try {
      const token = localStorage.getItem("token");

      // 🔥 TRY BACKEND FIRST
      if (token) {
        const res = await fetch("http://localhost:5000/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 🔥 AUTO LOGOUT FIX
        if (res.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (res.ok) {
          let data = await res.json();

          console.log("RAW BACKEND DATA:", data);

          // ✅ FORCE ARRAY (VERY IMPORTANT FIX)
          if (!Array.isArray(data)) {
            data = data?.courses || [];
          }

          console.log("FINAL COURSES ARRAY:", data);

          setCourses(data); // ✅ NO FILTER AT ALL
          return;
        }
      }
    } catch (err) {
      console.log("Backend failed, using localStorage");
    }

    // 🔥 FALLBACK (localStorage)
    let stored = JSON.parse(
      localStorage.getItem("learn_hub_courses") || "[]"
    );

    console.log("RAW LOCAL DATA:", stored);

    // ✅ FORCE ARRAY
    if (!Array.isArray(stored)) {
      stored = [];
    }

    setCourses(stored); // ✅ NO FILTER
  };

  // 🔥 ENROLL FUNCTION (UNCHANGED)
  const enrollCourse = (courseId: string) => {
    const user = JSON.parse(
      localStorage.getItem("learn_hub_user") || "{}"
    );

    const enrollments = JSON.parse(
      localStorage.getItem("enrollments") || "[]"
    );

    const already = enrollments.find(
      (e: any) =>
        e.courseId === courseId && e.user === user.email
    );

    if (already) {
      alert("Already enrolled");
      return;
    }

    enrollments.push({
      user: user.email,
      courseId,
    });

    localStorage.setItem(
      "enrollments",
      JSON.stringify(enrollments)
    );

    alert("Enrolled successfully");
  };

  useEffect(() => {
    loadCourses();

    window.addEventListener("focus", loadCourses);
    return () => window.removeEventListener("focus", loadCourses);
  }, []);

  // 🔥 DEBUG VIEW
  console.log("COURSES STATE:", courses);

  if (!courses || courses.length === 0) {
    return <h3 style={{ padding: 20 }}>No courses found</h3>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>📚 Browse Courses</h2>

      {courses.map((course, index) => (
        <div
          key={course.id || index}
          style={{
            border: "1px solid #ddd",
            padding: 20,
            marginBottom: 15,
            borderRadius: 8,
          }}
        >
          <h3>{course.title || "Untitled Course"}</h3>
          <p>Lessons: {course.lessons?.length || 0}</p>

          <button onClick={() => navigate(`/course/${course.id}`)}>
            View Course
          </button>

          <button
            style={{ marginLeft: 10 }}
            onClick={() =>
              navigate(
                `/course/${course.id}/lesson/${course.lessons?.[0]?.id}`
              )
            }
          >
            Start Learning
          </button>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => enrollCourse(course.id)}
          >
            Enroll
          </button>
        </div>
      ))}
    </div>
  );
}