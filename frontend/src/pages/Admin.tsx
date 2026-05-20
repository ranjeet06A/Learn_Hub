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

  const [editingQuiz, setEditingQuiz] =
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
    } catch (err) {
      console.log(err);

      const stored = JSON.parse(
        localStorage.getItem(
          "learn_hub_courses"
        ) || "[]"
      );

      setCourses(stored);
    }
  };

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
        }
      } catch (err) {
        console.log(err);
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
          "Delete this course?"
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
        }
      } catch (err) {
        console.log(err);
      }
    };

  // =========================
  // DELETE LESSON
  // =========================
  const handleDeleteLesson =
    async (
      courseId: string,
      lessonId: string
    ) => {
      const confirmDelete =
        window.confirm(
          "Delete this lesson?"
        );

      if (!confirmDelete) return;

      try {
        const response =
          await fetch(
            `${backend}/courses/${courseId}/lessons/${lessonId}`,
            {
              method:
                "DELETE",
            }
          );

        const data =
          await response.json();

        if (data.success) {
          alert(
            "Lesson Deleted"
          );

          await loadCourses();
        }
      } catch (err) {
        console.log(err);
      }
    };

  // =========================
  // DELETE QUIZ
  // =========================
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
        }
      } catch (err) {
        console.log(err);
      }
    };

  // =========================
  // EDIT QUIZ
  // =========================
  const handleEditQuiz =
    (
      courseId: string,
      lessonId: string,
      quizIndex: number,
      quiz: any
    ) => {
      setEditingQuiz({
        ...quiz,
        courseId,
        lessonId,
        quizIndex,
      });
    };

  const handleSaveEditedQuiz =
    async () => {
      try {
        const response =
          await fetch(
            `${backend}/courses/${editingQuiz.courseId}/lessons/${editingQuiz.lessonId}/quizzes/${editingQuiz.quizIndex}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                editingQuiz
              ),
            }
          );

        const data =
          await response.json();

        if (data.success) {
          alert(
            "Quiz Updated"
          );

          setEditingQuiz(
            null
          );

          await loadCourses();
        }
      } catch (err) {
        console.log(err);
      }
    };

  // =========================
  // DELETE QUESTION
  // =========================
  const handleDeleteQuestion =
    (
      questionIndex: number
    ) => {
      const updatedQuestions =
        editingQuiz.questions.filter(
          (
            _: any,
            i: number
          ) =>
            i !==
            questionIndex
        );

      setEditingQuiz({
        ...editingQuiz,
        questions:
          updatedQuestions,
      });
    };

  // =========================
  // ADD QUESTION
  // =========================
  const handleAddQuestion =
    () => {
      setEditingQuiz({
        ...editingQuiz,

        questions: [
          ...(editingQuiz.questions ||
            []),

          {
            questionTitle:
              "",

            statements: [],

            options: [
              "",
              "",
              "",
              "",
            ],

            correctIndex: 0,
          },
        ],
      });
    };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: 20 }}>
      <h2>⚙️ Admin Panel</h2>

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

          <button
            onClick={() =>
              handleEditCourse(
                c
              )
            }
          >
            Edit Course
          </button>

          <button
            onClick={() =>
              handleDeleteCourse(
                c.id
              )
            }
          >
            Delete Course
          </button>

          {c.lessons?.map(
            (l: any) => (
              <div
                key={l.id}
                style={{
                  marginTop: 20,
                  borderTop:
                    "1px solid #ddd",
                  paddingTop: 10,
                }}
              >
                <h4>
                  {l.title}
                </h4>

                <button
                  onClick={() =>
                    handleDeleteLesson(
                      c.id,
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
                        <strong>
                          {q.title ||
                            `Quiz ${
                              index + 1
                            }`}
                        </strong>

                        <div>
                          Questions:
                          {" "}
                          {Array.isArray(
                            q.questions
                          )
                            ? q.questions
                                .length
                            : 0}
                        </div>

                        <button
                          onClick={() =>
                            handleEditQuiz(
                              c.id,
                              l.id,
                              index,
                              q
                            )
                          }
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
                        >
                          Delete Quiz
                        </button>

                        {editingQuiz &&
                          editingQuiz._id ===
                            q._id && (
                            <div
                              style={{
                                marginTop: 20,
                                border:
                                  "1px solid #999",
                                padding: 15,
                              }}
                            >
                              <h4>
                                Edit Quiz
                              </h4>

                              {editingQuiz.questions?.map(
                                (
                                  ques: any,
                                  qIndex: number
                                ) => (
                                  <div
                                    key={
                                      qIndex
                                    }
                                  >
                                    <input
                                      value={
                                        ques.questionTitle
                                      }
                                      onChange={(
                                        e
                                      ) => {
                                        const updated =
                                          [
                                            ...editingQuiz.questions,
                                          ];

                                        updated[
                                          qIndex
                                        ].questionTitle =
                                          e.target.value;

                                        setEditingQuiz(
                                          {
                                            ...editingQuiz,
                                            questions:
                                              updated,
                                          }
                                        );
                                      }}
                                    />

                                    {ques.options?.map(
                                      (
                                        opt: string,
                                        optIndex: number
                                      ) => (
                                        <input
                                          key={
                                            optIndex
                                          }
                                          value={
                                            opt
                                          }
                                          onChange={(
                                            e
                                          ) => {
                                            const updated =
                                              [
                                                ...editingQuiz.questions,
                                              ];

                                            updated[
                                              qIndex
                                            ].options[
                                              optIndex
                                            ] =
                                              e.target.value;

                                            setEditingQuiz(
                                              {
                                                ...editingQuiz,
                                                questions:
                                                  updated,
                                              }
                                            );
                                          }}
                                        />
                                      )
                                    )}

                                    <button
                                      onClick={() =>
                                        handleDeleteQuestion(
                                          qIndex
                                        )
                                      }
                                    >
                                      Delete Question
                                    </button>
                                  </div>
                                )
                              )}

                              <button
                                onClick={
                                  handleAddQuestion
                                }
                              >
                                Add Question
                              </button>

                              <button
                                onClick={
                                  handleSaveEditedQuiz
                                }
                              >
                                Save Quiz
                              </button>
                            </div>
                          )}
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