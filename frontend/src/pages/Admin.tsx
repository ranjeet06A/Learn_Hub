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

  const [editingLessonId, setEditingLessonId] =
    useState<any>(null);

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

      console.log(
        "RAW BACKEND DATA:",
        data
      );

      if (Array.isArray(data)) {
        const fixed = data.map((c: any) => ({
          ...c,
          lessons: Array.isArray(c.lessons)
            ? c.lessons
            : [],
        }));

        setCourses(fixed);

        localStorage.setItem(
          "learn_hub_courses",
          JSON.stringify(fixed)
        );

        console.log(
          "FINAL COURSES ARRAY:",
          fixed
        );
      }
    } catch (err) {
      console.log(
        "Backend load failed"
      );

      const storedCourses = JSON.parse(
        localStorage.getItem(
          "learn_hub_courses"
        ) || "[]"
      );

      setCourses(storedCourses);
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
  // SAVE EXAMS
  // =========================
  const saveExams = (data: string[]) => {
    localStorage.setItem(
      "learn_hub_exams",
      JSON.stringify(data)
    );

    setExams(data);
  };

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

    saveExams(updated);

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
      )
        return;

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
  // ADD / UPDATE LESSON
  // =========================
  const handleAddLesson =
    async () => {
      if (
        !lessonTitle ||
        !selectedCourseId
      )
        return;

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
          setEditingLessonId(
            null
          );

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
      if (
        !quizInput ||
        !selectedLessonId
      )
        return;

      let parsed;

      try {
        parsed =
          JSON.parse(
            quizInput
          );
      } catch {
        alert(
          "Invalid Quiz JSON"
        );
        return;
      }

      // force array
      if (
        !Array.isArray(parsed)
      ) {
        parsed = [parsed];
      }

      try {
        const response =
          await fetch(
            `${backend}/courses/${selectedCourseId}/lessons/${selectedLessonId}/quizzes`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                parsed
              ),
            }
          );

        const data =
          await response.json();

        if (data.success) {
          await loadCourses();

          setQuizInput("");

          alert(
            "Quiz Added"
          );
        }
      } catch (err) {
        console.log(err);
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
        confirm(
          "Delete Course?"
        );

      if (!confirmDelete)
        return;

      const updated =
        courses.filter(
          (c) =>
            String(
              c._id || c.id
            ) !==
            String(courseId)
        );

      setCourses(updated);

      localStorage.setItem(
        "learn_hub_courses",
        JSON.stringify(updated)
      );
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
            String(
              c._id || c.id
            ) ===
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
                      l._id ||
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

  // =========================
  // DELETE QUIZ
  // =========================
  const handleDeleteQuiz =
    (
      lessonId: string,
      quizIndex: number
    ) => {
      const updated =
        courses.map((c) => {
          if (
            String(
              c._id || c.id
            ) ===
            String(
              selectedCourseId
            )
          ) {
            return {
              ...c,
              lessons:
                c.lessons.map(
                  (l: any) => {
                    if (
                      String(
                        l._id ||
                          l.id
                      ) ===
                      String(
                        lessonId
                      )
                    ) {
                      return {
                        ...l,
                        quizzes:
                          (
                            l.quizzes ||
                            []
                          ).filter(
                            (
                              _: any,
                              i: number
                            ) =>
                              i !==
                              quizIndex
                          ),
                      };
                    }

                    return l;
                  }
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

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: 20 }}>
      <h2>⚙️ Admin Panel</h2>

      {/* ADD EXAM */}
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

      {/* ADD COURSE */}
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

      {/* ADD LESSON */}
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
            key={
              c._id ||
              c.id
            }
            value={
              c._id ||
              c.id
            }
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
        cols={70}
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

      {/* ADD QUIZ */}
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
              String(
                c._id ||
                  c.id
              ) ===
              String(
                selectedCourseId
              )
          )
          ?.lessons?.map(
            (l: any) => (
              <option
                key={
                  l._id ||
                  l.id
                }
                value={
                  l._id ||
                  l.id
                }
              >
                {l.title}
              </option>
            )
          )}
      </select>

      <br />
      <br />

      <textarea
        rows={10}
        cols={70}
        value={quizInput}
        onChange={(e) =>
          setQuizInput(
            e.target.value
          )
        }
        placeholder={`[
{
"questionTitle":"2+2=?",
"options":["1","2","4","5"],
"correctIndex":2
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
          key={c._id || c.id}
          style={{
            border:
              "1px solid #ccc",
            padding: 10,
            marginBottom: 20,
          }}
        >
          <h3>{c.title}</h3>

          <button
            onClick={() =>
              handleDeleteCourse(
                c._id ||
                  c.id
              )
            }
          >
            Delete Course
          </button>

          {c.lessons?.map(
            (l: any) => (
              <div
                key={
                  l._id ||
                  l.id
                }
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
                      l._id ||
                        l.id
                    )
                  }
                >
                  Delete Lesson
                </button>

                <button
                  style={{
                    marginLeft: 10,
                  }}
                  onClick={() => {
                    setLessonTitle(
                      l.title
                    );

                    setLessonContent(
                      l.content
                    );

                    setEditingLessonId(
                      l._id ||
                        l.id
                    );
                  }}
                >
                  Edit Lesson
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
                        key={
                          index
                        }
                      >
                        {
                          q.questionTitle
                        }

                        <button
                          style={{
                            marginLeft: 10,
                          }}
                          onClick={() =>
                            handleDeleteQuiz(
                              l._id ||
                                l.id,
                              index
                            )
                          }
                        >
                          Delete Quiz
                        </button>
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