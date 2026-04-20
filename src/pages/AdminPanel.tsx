import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseManager, quizManager } from "../utils/adminManager";
import type { Course, Lesson, Quiz } from "../utils/adminManager";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<"courses" | "quizzes">("courses");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingQuizCourse, setEditingQuizCourse] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const [newLesson, setNewLesson] = useState({ title: "", content: "" });
  const [newQuiz, setNewQuiz] = useState({ question: "", options: ["", "", "", ""], answer: "" });

  const ADMIN_PASSWORD = "admin123";

  useEffect(() => {
    if (isAuthenticated) {
      setCourses(courseManager.getAllCourses());
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword("");
    } else {
      alert("❌ Incorrect password!");
    }
  };

  const handleAddCourse = () => {
    if (!newCourse.title.trim()) {
      alert("Please enter course title");
      return;
    }
    const course: Course = {
      id: 0,
      title: newCourse.title,
      description: newCourse.description,
      lessons: [],
    };
    courseManager.addCourse(course);
    setCourses(courseManager.getAllCourses());
    setNewCourse({ title: "", description: "" });
  };

  const handleUpdateCourse = () => {
    if (!editingCourse) return;
    courseManager.updateCourse(editingCourse.id, editingCourse);
    setCourses(courseManager.getAllCourses());
    setEditingCourse(null);
  };

  const handleDeleteCourse = (id: number) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      courseManager.deleteCourse(id);
      setCourses(courseManager.getAllCourses());
    }
  };

  const handleAddLesson = (courseId: number) => {
    if (!newLesson.title.trim()) {
      alert("Please enter lesson title");
      return;
    }
    courseManager.addLessonToCourse(courseId, newLesson);
    setCourses(courseManager.getAllCourses());
    setNewLesson({ title: "", content: "" });
  };

  const handleDeleteLesson = (courseId: number, lessonId: number) => {
    if (window.confirm("Delete this lesson?")) {
      courseManager.deleteLessonFromCourse(courseId, lessonId);
      setCourses(courseManager.getAllCourses());
      setEditingCourse(courseManager.getCourseById(courseId));
    }
  };

  const handleAddQuiz = (courseId: number) => {
    if (!newQuiz.question.trim()) {
      alert("Please enter quiz question");
      return;
    }
    if (newQuiz.options.some((opt) => !opt.trim())) {
      alert("All options must be filled");
      return;
    }
    if (!newQuiz.answer.trim()) {
      alert("Please select correct answer");
      return;
    }
    quizManager.addQuizToCourse(courseId, newQuiz);
    setNewQuiz({ question: "", options: ["", "", "", ""], answer: "" });
  };

  const handleDeleteQuiz = (courseId: number, index: number) => {
    if (window.confirm("Delete this quiz question?")) {
      quizManager.deleteQuiz(courseId, index);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            textAlign: "center",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <h1 style={{ marginBottom: "20px", color: "#333" }}>🔐 Admin Panel</h1>
          <p style={{ color: "#666", marginBottom: "20px" }}>Enter password to access admin panel</p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              border: "2px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Login
          </button>
          <p style={{ marginTop: "15px", color: "#999", fontSize: "12px" }}>Hint: admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>⚙️ Admin Panel</h1>
        <button
          onClick={() => {
            setIsAuthenticated(false);
            navigate("/");
          }}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "30px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
          <button
            onClick={() => setActiveTab("courses")}
            style={{
              padding: "12px 25px",
              backgroundColor: activeTab === "courses" ? "#667eea" : "white",
              color: activeTab === "courses" ? "white" : "#333",
              border: "2px solid #667eea",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            📚 Manage Courses
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            style={{
              padding: "12px 25px",
              backgroundColor: activeTab === "quizzes" ? "#667eea" : "white",
              color: activeTab === "quizzes" ? "white" : "#333",
              border: "2px solid #667eea",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            ❓ Manage Quizzes
          </button>
        </div>

        {/* COURSES TAB */}
        {activeTab === "courses" && (
          <div>
            {/* Add Course Form */}
            <div style={{ background: "white", padding: "25px", borderRadius: "12px", marginBottom: "30px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}>
              <h2 style={{ marginTop: 0, color: "#333" }}>➕ Add New Course</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "15px", marginBottom: "15px" }}>
                <input
                  type="text"
                  placeholder="Course Title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  style={{ padding: "12px", border: "2px solid #ddd", borderRadius: "8px" }}
                />
                <input
                  type="text"
                  placeholder="Course Description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  style={{ padding: "12px", border: "2px solid #ddd", borderRadius: "8px" }}
                />
              </div>
              <button
                onClick={handleAddCourse}
                style={{
                  backgroundColor: "#4ECDC4",
                  color: "white",
                  border: "none",
                  padding: "12px 25px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Add Course
              </button>
            </div>

            {/* Edit Course Form */}
            {editingCourse && (
              <div style={{ background: "white", padding: "25px", borderRadius: "12px", marginBottom: "30px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", borderLeft: "4px solid #667eea" }}>
                <h2 style={{ marginTop: 0, color: "#333" }}>✏️ Edit Course</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "15px", marginBottom: "15px" }}>
                  <input
                    type="text"
                    placeholder="Course Title"
                    value={editingCourse.title}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                    style={{ padding: "12px", border: "2px solid #ddd", borderRadius: "8px" }}
                  />
                  <input
                    type="text"
                    placeholder="Course Description"
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                    style={{ padding: "12px", border: "2px solid #ddd", borderRadius: "8px" }}
                  />
                </div>

                {/* Lessons */}
                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                  <h3 style={{ marginTop: 0 }}>📖 Lessons</h3>
                  {editingCourse.lessons.map((lesson) => (
                    <div key={lesson.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", padding: "10px", backgroundColor: "white", borderRadius: "6px" }}>
                      <div>
                        <strong>{lesson.title}</strong>
                        <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "13px" }}>{lesson.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteLesson(editingCourse.id, lesson.id)}
                        style={{
                          backgroundColor: "#FF6B6B",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                  {/* Add Lesson */}
                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #ddd" }}>
                    <h4>Add Lesson</h4>
                    <input
                      type="text"
                      placeholder="Lesson Title"
                      value={newLesson.title}
                      onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                      style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ddd", borderRadius: "6px", boxSizing: "border-box" }}
                    />
                    <textarea
                      placeholder="Lesson Content"
                      value={newLesson.content}
                      onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                      style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ddd", borderRadius: "6px", boxSizing: "border-box", minHeight: "80px" }}
                    />
                    <button
                      onClick={() => handleAddLesson(editingCourse.id)}
                      style={{
                        backgroundColor: "#4ECDC4",
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      Add Lesson
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={handleUpdateCourse}
                    style={{
                      backgroundColor: "#667eea",
                      color: "white",
                      border: "none",
                      padding: "12px 25px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingCourse(null)}
                    style={{
                      backgroundColor: "#ddd",
                      color: "#333",
                      border: "none",
                      padding: "12px 25px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Courses List */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {courses.map((course) => (
                <div key={course.id} style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}>
                  <h3 style={{ marginTop: 0, color: "#333" }}>{course.title}</h3>
                  <p style={{ color: "#666", fontSize: "14px", margin: "0 0 15px 0" }}>{course.description}</p>
                  <p style={{ color: "#999", fontSize: "13px", margin: "10px 0" }}>📖 {course.lessons.length} lessons</p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => setEditingCourse(course)}
                      style={{
                        flex: 1,
                        backgroundColor: "#667eea",
                        color: "white",
                        border: "none",
                        padding: "10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      style={{
                        flex: 1,
                        backgroundColor: "#FF6B6B",
                        color: "white",
                        border: "none",
                        padding: "10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUIZZES TAB */}
        {activeTab === "quizzes" && (
          <div>
            {courses.map((course) => (
              <div key={course.id} style={{ background: "white", padding: "25px", borderRadius: "12px", marginBottom: "30px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}>
                <h2 style={{ marginTop: 0, color: "#333" }}>
                  ❓ Quizzes for {course.title}
                </h2>

                {/* Add Quiz Form */}
                {editingQuizCourse === course.id && (
                  <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
                    <h4>Add Quiz Question</h4>
                    <textarea
                      placeholder="Question"
                      value={newQuiz.question}
                      onChange={(e) => setNewQuiz({ ...newQuiz, question: e.target.value })}
                      style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ddd", borderRadius: "6px", boxSizing: "border-box" }}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                      {newQuiz.options.map((opt, i) => (
                        <input
                          key={i}
                          type="text"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...newQuiz.options];
                            newOptions[i] = e.target.value;
                            setNewQuiz({ ...newQuiz, options: newOptions });
                          }}
                          style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
                        />
                      ))}
                    </div>
                    <select
                      value={newQuiz.answer}
                      onChange={(e) => setNewQuiz({ ...newQuiz, answer: e.target.value })}
                      style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ddd", borderRadius: "6px", boxSizing: "border-box" }}
                    >
                      <option value="">Select Correct Answer</option>
                      {newQuiz.options.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt || `Option ${i + 1}`}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleAddQuiz(course.id)}
                        style={{
                          backgroundColor: "#4ECDC4",
                          color: "white",
                          border: "none",
                          padding: "10px 15px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Add Question
                      </button>
                      <button
                        onClick={() => setEditingQuizCourse(null)}
                        style={{
                          backgroundColor: "#ddd",
                          color: "#333",
                          border: "none",
                          padding: "10px 15px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Quiz Questions List */}
                {quizManager.getQuizByCourse(course.id).map((quiz, index) => (
                  <div key={index} style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <strong>{quiz.question}</strong>
                        <div style={{ marginTop: "8px", fontSize: "13px", color: "#666" }}>
                          {quiz.options.map((opt, i) => (
                            <div key={i} style={{ marginBottom: "3px" }}>
                              {opt === quiz.answer ? <strong>✓ {opt}</strong> : opt}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteQuiz(course.id, index)}
                        style={{
                          backgroundColor: "#FF6B6B",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                          marginLeft: "10px",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {editingQuizCourse !== course.id && (
                  <button
                    onClick={() => setEditingQuizCourse(course.id)}
                    style={{
                      backgroundColor: "#667eea",
                      color: "white",
                      border: "none",
                      padding: "10px 15px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      marginTop: "10px",
                    }}
                  >
                    ➕ Add Question
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
