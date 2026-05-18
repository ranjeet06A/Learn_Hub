import { useEffect, useState } from "react";
import mammoth from "mammoth";

export default function Admin() {
  const [courses, setCourses] = useState<any[]>([]);
  const [exams, setExams] = useState<string[]>([]);

  const [selectedExam, setSelectedExam] =
    useState("");

  const [courseTitle, setCourseTitle] =
    useState("");

  const [lessonTitle, setLessonTitle] =
    useState("");

  const [lessonContent, setLessonContent] =
    useState("");

  const [selectedCourseId, setSelectedCourseId] =
    useState("");

  const [selectedLessonId, setSelectedLessonId] =
    useState("");

  const [quizInput, setQuizInput] =
    useState("");

  const backend =
    "https://learn-hub-backend-g1pi.onrender.com";

  // =========================
  // LOAD COURSES
  // =========================
  const loadCourses = async () => {
    try {
      const res = await fetch(
        `${backend}/courses`
      );

      const data = await res.json();

      const fixed = Array.isArray(data)
        ? data.map((c: any) => ({
            ...c,
            id: c._id || c.id,
            lessons: Array.isArray(c.lessons)
              ? c.lessons.map((l: any) => ({
                  ...l,
                  id: l._id || l.id,
                  quizzes:
                    l.quizzes || [],
                }))
              : [],
          }))
        : [];

      setCourses(fixed);

      localStorage.setItem(
        "learn_hub_courses",
        JSON.stringify(fixed)
      );

      console.log(
        "FINAL COURSES ARRAY:",
        fixed
      );
    } catch (err) {
      console.log(
        "Backend failed, using local"
      );

      const stored = JSON.parse(
        localStorage.getItem(
          "learn_hub_courses"
        ) || "[]"
      );

      setCourses(stored);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    loadCourses();

    const storedExams = JSON.parse(
      localStorage.getItem(
        "learn_hub_exams"
      ) || "[]"
    );

    setExams(storedExams);
  }, []);

  // =========================
  // DOCX IMPORT
  // =========================
  const handleDocxUpload = async (
    e: any
  ) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (
      event: any
    ) => {
      const arrayBuffer =
        event.target.result;

      const result =
        await mammoth.convertToHtml({
          arrayBuffer,
        });

      setLessonContent(
        result.value
      );
    };

    reader.readAsArrayBuffer(file);
  };

  // =========================
  // ADD EXAM
  // =========================
  const handleAddExam = () => {
    if (!selectedExam.trim()) return;

    if (
      exams.includes(selectedExam)
    ) {
      alert("Exam already exists");
      return;
    }

    const updated = [
      ...exams,
      selectedExam,
    ];

    setExams(updated);

    localStorage.setItem(
      "learn_hub_exams",
      JSON.stringify(updated)
    );

    setSelectedExam("");

    alert("Exam Added");
  };

  // =========================
  // ADD COURSE
  // =========================
  const handleAddCourse =
    async () => {
      if (
        !courseTitle ||
        !selectedExam
      ) {
        alert("Fill all fields");
        return;
      }

      try {
        const res = await fetch(
          `${backend}/courses`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              title: courseTitle,
              examId:
                selectedExam,
            }),
          }
        );

        const data =
          await res.json();

        if (data.success) {
          await loadCourses();

          setCourseTitle("");

          alert(
            "Course Added"
          );
        }
      } catch (err) {
        console.log(err);
      }
    };

  // =========================
  // EDIT COURSE
  // =========================
  const handleEditCourse =
    async (course: any) => {
      const newTitle = prompt(
        "Enter new course title",
        course.title
      );

      if (!newTitle) return;

      try {
        const response =
          await fetch(
            `${backend}/courses/${course.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                title: newTitle,
                examId:
                  course.examId,
                lessons:
                  course.lessons,
              }),
            }
          );

        const data =
          await response.json();

        if (data.success) {
          alert(
            "Course Updated"
          );

          await loadCourses();
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.log(err);

        alert("Update failed");
      }
    };

  // =========================
  // ADD LESSON
  // =========================
  const handleAddLesson =
    async () => {
      if (
        !lessonTitle ||
        !selectedCourseId
      ) {
        alert("Fill all fields");
        return;
      }

      try {
        const response =
          await fetch(
            `${backend}/courses/${selectedCourseId}/lessons`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                title:
                  lessonTitle,
                content:
                  lessonContent,
              }),
            }
          );

        const data =
          await response.json();

        if (data.success) {
          await loadCourses();

          setLessonTitle("");
          setLessonContent("");

          alert(
            "Lesson Added"
          );
        }
      } catch (err) {
        console.log(err);
      }
    };

  // =========================
  // ADD QUIZ
  // =========================
  const handleAddQuiz =
    async () => {
      try {
        if (
          !selectedCourseId ||
          !selectedLessonId
        ) {
          alert(
            "Select course and lesson"
          );
          return;
        }

        if (!quizInput.trim()) {
          alert(
            "Quiz JSON required"
          );
          return;
        }

        let parsed = JSON.parse(
          quizInput
        );

        if (
          !Array.isArray(parsed)
        ) {
          parsed = [parsed];
        }

        const cleaned =
          parsed.map((q: any) => ({
            questionTitle:
              q.questionTitle ||
              "",

            statements:
              Array.isArray(
                q.statements
              )
                ? q.statements
                : [],

            options:
              Array.isArray(
                q.options
              )
                ? q.options
                : [],

            correctIndex:
              Number(
                q.correctIndex
              ) || 0,
          }));

        const response =
          await fetch(
            `${backend}/courses/${selectedCourseId}/lessons/${selectedLessonId}/quizzes`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
  title: `Quiz ${Date.now()}`,
  questions: cleaned,
}),
            }
          );

        const data =
          await response.json();

        if (data.success) {
          alert("Quiz Added");

          setQuizInput("");

          await loadCourses();
        } else {
          alert(
            data.message ||
              "Failed to add quiz"
          );
        }
      } catch (err) {
        console.log(err);

        alert(
          "Invalid JSON format"
        );
      }
    };

  // =========================
  // DELETE COURSE
  // =========================
  const handleDeleteCourse =
    async (
      courseId: string
    ) => {
      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this course?"
        );

      if (!confirmDelete) return;

      try {
        const response =
          await fetch(
            `${backend}/courses/${courseId}`,
            {
              method:
                "DELETE",
            }
          );

        const data =
          await response.json();

        if (data.success) {
          alert(
            "Course Deleted"
          );

          await loadCourses();
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.log(err);

        alert(
          "Delete failed"
        );
      }
    };

  // =========================
  // DELETE LESSON
  // =========================
  const handleDeleteLesson =
    (
      lessonId: string
    ) => {
      const updated =
        courses.map((c) => {
          if (
            String(c.id) ===
            String(
              selectedCourseId
            )
          ) {
            return {
              ...c,
              lessons:
                c.lessons.filter(
                  (l: any) =>
                    String(
                      l.id
                    ) !==
                    String(
                      lessonId
                    )
                ),
            };
          }

          return c;
        });

      setCourses(updated);

      localStorage.setItem(
        "learn_hub_courses",
        JSON.stringify(updated)
      );
    };

    const handleDeleteQuiz =
  async (
    courseId: string,
    lessonId: string,
    quizIndex: number
  ) => {
    const confirmDelete =
      window.confirm(
        "Delete this quiz?"
      );

    if (!confirmDelete) return;

    try {
      const response =
        await fetch(
          `${backend}/courses/${courseId}/lessons/${lessonId}/quizzes/${quizIndex}`,
          {
            method:
              "DELETE",
          }
        );

      const data =
        await response.json();

      if (data.success) {
        alert(
          "Quiz Deleted"
        );

        await loadCourses();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);

      alert(
        "Delete failed"
      );
    }
  };
  const handleEditQuiz =
  async (
    courseId: string,
    lessonId: string,
    quizIndex: number,
    quiz: any
  ) => {
    const newQuestion =
      prompt(
        "Edit Question",
        quiz.questionTitle
      );

    if (!newQuestion) return;

    try {
      const updatedQuiz = {
        ...quiz,
        questionTitle:
          newQuestion,
      };

      const response =
        await fetch(
          `${backend}/courses/${courseId}/lessons/${lessonId}/quizzes/${quizIndex}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              updatedQuiz
            ),
          }
        );

      const data =
        await response.json();

      if (data.success) {
        alert(
          "Quiz Updated"
        );

        await loadCourses();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);

      alert(
        "Update failed"
      );
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: 20 }}>
      <h2>⚙️ Admin Panel</h2>

      {/* EXAM */}
      <h3>Add Exam</h3>

      <input
        value={selectedExam}
        onChange={(e) =>
          setSelectedExam(
            e.target.value
          )
        }
      />

      <button
        onClick={
          handleAddExam
        }
      >
        Add Exam
      </button>

      {/* COURSE */}
      <h3>Add Course</h3>

      <input
        placeholder="Course Title"
        value={courseTitle}
        onChange={(e) =>
          setCourseTitle(
            e.target.value
          )
        }
      />

      <select
        value={selectedExam}
        onChange={(e) =>
          setSelectedExam(
            e.target.value
          )
        }
      >
        <option value="">
          Select Exam
        </option>

        {exams.map(
          (e, i) => (
            <option
              key={i}
              value={e}
            >
              {e}
            </option>
          )
        )}
      </select>

      <button
        onClick={
          handleAddCourse
        }
      >
        Add Course
      </button>

      {/* LESSON */}
      <h3>Add Lesson</h3>

      <select
        value={
          selectedCourseId
        }
        onChange={(e) =>
          setSelectedCourseId(
            e.target.value
          )
        }
      >
        <option value="">
          Select Course
        </option>

        {courses.map((c) => (
          <option
            key={c.id}
            value={c.id}
          >
            {c.title}
          </option>
        ))}
      </select>

      <br />
      <br />

      <input
        placeholder="Lesson Title"
        value={lessonTitle}
        onChange={(e) =>
          setLessonTitle(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <textarea
        rows={10}
        cols={80}
        placeholder="Lesson Content"
        value={lessonContent}
        onChange={(e) =>
          setLessonContent(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="file"
        accept=".docx"
        onChange={
          handleDocxUpload
        }
      />

      <br />
      <br />

      <button
        onClick={
          handleAddLesson
        }
      >
        Add Lesson
      </button>

      {/* QUIZ */}
      <h3>Add Quiz</h3>

      <select
        value={
          selectedLessonId
        }
        onChange={(e) =>
          setSelectedLessonId(
            e.target.value
          )
        }
      >
        <option value="">
          Select Lesson
        </option>

        {courses
          .find(
            (c) =>
              String(c.id) ===
              String(
                selectedCourseId
              )
          )
          ?.lessons?.map(
            (l: any) => (
              <option
                key={l.id}
                value={l.id}
              >
                {l.title}
              </option>
            )
          )}
      </select>

      <br />
      <br />

      <textarea
        rows={15}
        cols={90}
        value={quizInput}
        onChange={(e) =>
          setQuizInput(
            e.target.value
          )
        }
        placeholder={`[
{
  "questionTitle":"Question?",
  "statements":["A","B"],
  "options":["1","2","3","4"],
  "correctIndex":0
}
]`}
      />

      <br />
      <br />

      <button
        onClick={
          handleAddQuiz
        }
      >
        Add Quiz
      </button>

      {/* COURSES */}
      <h3>All Courses</h3>

      {courses.map((c) => (
        <div
          key={c.id}
          style={{
            border:
              "1px solid #ccc",
            padding: 15,
            marginBottom: 20,
          }}
        >
          <h3>{c.title}</h3>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <button
              onClick={() =>
                handleEditCourse(
                  c
                )
              }
              style={{
                background:
                  "blue",
                color: "white",
                padding:
                  "6px 12px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Edit Course
            </button>

            <button
              onClick={() =>
                handleDeleteCourse(
                  c.id
                )
              }
              style={{
                background:
                  "red",
                color: "white",
                padding:
                  "6px 12px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Delete Course
            </button>
          </div>

          {c.lessons?.map(
            (l: any) => (
              <div
                key={l.id}
                style={{
                  marginTop: 20,
                  padding: 10,
                  borderTop:
                    "1px solid #ddd",
                }}
              >
                <h4>
                  {l.title}
                </h4>

                <button
                  onClick={() =>
                    handleDeleteLesson(
                      l.id
                    )
                  }
                >
                  Delete Lesson
                </button>

                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  <b>
                    Quizzes:
                  </b>

                  {(l.quizzes ||
                    []
                  ).map(
                    (
                      q: any,
                      index: number
                    ) => (
                      <div
  key={index}
  style={{
    border:
      "1px solid #ddd",
    padding: 10,
    marginTop: 10,
  }}
>
  <div>
  <strong>
    {q.title || `Quiz ${index + 1}`}
  </strong>

  <div style={{ marginTop: 5 }}>
    Questions:
    {" "}
    {Array.isArray(q.questions)
      ? q.questions.length
      : 0}
  </div>
</div>

  <div
    style={{
      display: "flex",
      gap: 10,
      marginTop: 10,
    }}
  >
    <button
      onClick={() =>
        handleEditQuiz(
          c.id,
          l.id,
          index,
          q
        )
      }
      style={{
        background:
          "blue",
        color: "white",
        border: "none",
        padding:
          "5px 10px",
      }}
    >
      Edit Quiz
    </button>

    <button
      onClick={() =>
        handleDeleteQuiz(
          c.id,
          l.id,
          index
        )
      }
      style={{
        background:
          "red",
        color: "white",
        border: "none",
        padding:
          "5px 10px",
      }}
    >
      Delete Quiz
    </button>
  </div>
</div>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
}