import { useEffect, useState } from "react";
import mammoth from "mammoth";

export default function Admin() {
  const [courses, setCourses] = useState<any[]>([]);
  const [exams, setExams] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [quizInput, setQuizInput] = useState("");
  const [editingLessonId, setEditingLessonId] = useState<any>(null);

  useEffect(() => {
    const storedCourses = JSON.parse(
      localStorage.getItem("learn_hub_courses") || "[]"
    );
    const storedExams = JSON.parse(
      localStorage.getItem("learn_hub_exams") || "[]"
    );

    setCourses(storedCourses);
    setExams(storedExams);
  }, []);

  const saveCourses = (data: any[]) => {
    localStorage.setItem("learn_hub_courses", JSON.stringify(data));
    setCourses(data);
  };

  const saveExams = (data: string[]) => {
    localStorage.setItem("learn_hub_exams", JSON.stringify(data));
    setExams(data);
  };

  const handleDeleteCourse = (courseId: string | number) => {
    const updated = courses.filter(
      (c) => String(c.id) !== String(courseId)
    );
    saveCourses(updated);
  };

  const handleDeleteLesson = (lessonId: any) => {
    const updated = courses.map((c) => {
      if (String(c.id) === String(selectedCourseId)) {
        return {
          ...c,
          lessons: c.lessons.filter(
            (l: any) => String(l.id) !== String(lessonId)
          ),
        };
      }
      return c;
    });

    saveCourses(updated);
  };

  const handleDeleteQuiz = (lessonId: any, quizIndex: number) => {
    const updated = courses.map((c) => {
      if (String(c.id) === String(selectedCourseId)) {
        return {
          ...c,
          lessons: c.lessons.map((l: any) => {
            if (String(l.id) === String(lessonId)) {
              return {
                ...l,
                quizzes: l.quizzes.filter(
                  (_: any, i: number) => i !== quizIndex
                ),
              };
            }
            return l;
          }),
        };
      }
      return c;
    });

    saveCourses(updated);
  };

  const handleDocxUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event: any) => {
      const arrayBuffer = event.target.result;
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setLessonContent(result.value);
    };

    reader.readAsArrayBuffer(file);
  };

  // ✅ FIXED: SAVE SELECTED EXAM GLOBALLY
  const handleAddExam = () => {
    if (!selectedExam) return;

    const updated = [...exams, selectedExam];
    saveExams(updated);

    // 🔥 IMPORTANT FIX
    localStorage.setItem("selected_exam", selectedExam);

    setSelectedExam("");
  };

  const handleAddCourse = () => {
    if (!courseTitle || !selectedExam) return;

    const newCourse = {
      id: Date.now(),
      title: courseTitle,
      examId: selectedExam,
      lessons: [],
    };

    saveCourses([...courses, newCourse]);
    setCourseTitle("");
  };

  const handleAddLesson = () => {
    if (!lessonTitle || !selectedCourseId) return;

    let updated;

    if (editingLessonId) {
      updated = courses.map((c) => {
        if (String(c.id) === String(selectedCourseId)) {
          return {
            ...c,
            lessons: c.lessons.map((l: any) =>
              String(l.id) === String(editingLessonId)
                ? { ...l, title: lessonTitle, content: lessonContent }
                : l
            ),
          };
        }
        return c;
      });
    } else {
      updated = courses.map((c) => {
        if (String(c.id) === String(selectedCourseId)) {
          return {
            ...c,
            lessons: [
              ...(c.lessons || []),
              {
                id: Date.now(),
                title: lessonTitle,
                content: lessonContent,
                quizzes: [],
              },
            ],
          };
        }
        return c;
      });
    }

    saveCourses(updated);
    setLessonTitle("");
    setLessonContent("");
    setEditingLessonId(null);
  };

  const handleAddQuiz = () => {
    if (!quizInput || !selectedCourseId) return;

    if (!selectedLessonId) {
      alert("Please select a lesson");
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(quizInput);
    } catch {
      alert("Invalid JSON");
      return;
    }

    const updated = courses.map((c) => {
      if (String(c.id) === String(selectedCourseId)) {
        return {
          ...c,
          lessons: c.lessons.map((l: any) => {
            if (String(l.id) === String(selectedLessonId)) {
              return {
                ...l,
                quizzes: [...(l.quizzes || []), parsed],
              };
            }
            return l;
          }),
        };
      }
      return c;
    });

    saveCourses(updated);
    setQuizInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>⚙️ Admin Panel</h2>

      <h3>Add Exam</h3>
      <input
        value={selectedExam}
        onChange={(e) => setSelectedExam(e.target.value)}
        placeholder="Enter exam name"
      />
      <button onClick={handleAddExam}>Add Exam</button>

      <h3>Add Course</h3>
      <input
        value={courseTitle}
        onChange={(e) => setCourseTitle(e.target.value)}
        placeholder="Course Title"
      />

      {/* ✅ FIXED DROPDOWN */}
      <select
        value={selectedExam}
        onChange={(e) => setSelectedExam(e.target.value)}
      >
        <option>Select Exam</option>
        {exams.map((e, i) => (
          <option key={i} value={e}>
            {e}
          </option>
        ))}
      </select>

      <button onClick={handleAddCourse}>Add Course</button>

      <h3>Add Lesson</h3>
      <select onChange={(e) => setSelectedCourseId(e.target.value)}>
        <option>Select Course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      <input
        value={lessonTitle}
        onChange={(e) => setLessonTitle(e.target.value)}
        placeholder="Lesson Title"
      />

      <textarea
        value={lessonContent}
        onChange={(e) => setLessonContent(e.target.value)}
        placeholder="Lesson Content"
      />

      <input type="file" accept=".docx" onChange={handleDocxUpload} />

      <button onClick={handleAddLesson}>
        {editingLessonId ? "Update Lesson" : "Add Lesson"}
      </button>

      <h3>Add Quiz</h3>

      <select onChange={(e) => setSelectedLessonId(e.target.value)}>
        <option>Select Lesson</option>
        {courses
          .find((c) => String(c.id) === String(selectedCourseId))
          ?.lessons?.map((l: any) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
      </select>

      <textarea
        value={quizInput}
        onChange={(e) => setQuizInput(e.target.value)}
        placeholder="Paste quiz JSON"
      />

      <button onClick={handleAddQuiz}>Add Quiz</button>

      <h3 style={{ marginTop: 30 }}>All Courses</h3>

      {courses.map((c) => (
        <div key={c.id} style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }}>
          <b>{c.title}</b>

          <button onClick={() => handleDeleteCourse(c.id)}>Delete</button>

          {String(c.id) === String(selectedCourseId) &&
            c.lessons?.map((l: any) => (
              <div key={l.id} style={{ marginTop: 10, paddingLeft: 20 }}>
                📘 {l.title}

                <button onClick={() => handleDeleteLesson(l.id)}>Delete</button>

                <button
                  onClick={() => {
                    setLessonTitle(l.title);
                    setLessonContent(l.content);
                    setEditingLessonId(l.id);
                  }}
                >
                  Edit
                </button>

                {l.quizzes?.map((q: any, i: number) => (
                  <div key={i} style={{ marginLeft: 20 }}>
                    📝 Quiz {i + 1}
                    <button onClick={() => handleDeleteQuiz(l.id, i)}>
                      Delete Quiz
                    </button>
                  </div>
                ))}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}