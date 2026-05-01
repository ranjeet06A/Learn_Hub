import React, { useState, useEffect } from "react";
import * as mammoth from "mammoth";

// ================= TYPES =================
type Lesson = {
  id: string;
  name: string;
  content?: string;
};

type Course = {
  id: string;
  name: string;
  lessons: Lesson[];
};

type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

// ================= COMPONENT =================
export default function AdminPanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");

  const [newCourse, setNewCourse] = useState("");
  const [newLesson, setNewLesson] = useState("");

  const [input, setInput] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<QuizQuestion[]>([]);

  // ================= LOAD =================
  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem("learn_hub_courses") || "[]"
    );
    setCourses(data);
  }, []);

  const saveCourses = (updated: Course[]) => {
    setCourses(updated);
    localStorage.setItem("learn_hub_courses", JSON.stringify(updated));
  };

  // ================= ADD COURSE =================
  const addCourse = () => {
    if (!newCourse) return;

    const newC: Course = {
      id: Date.now().toString(),
      name: newCourse,
      lessons: [],
    };

    saveCourses([...courses, newC]);
    setNewCourse("");
  };

  // ================= ADD LESSON =================
  const addLesson = () => {
    if (!selectedCourse || !newLesson) return;

    const updated = courses.map((c) => {
      if (c.id === selectedCourse) {
        return {
          ...c,
          lessons: [
            ...c.lessons,
            {
              id: Date.now().toString(),
              name: newLesson,
              content: "",
            },
          ],
        };
      }
      return c;
    });

    saveCourses(updated);
    setNewLesson("");
  };

  // ================= DOCX UPLOAD =================
  const handleDocxUpload = async (file: File) => {
    if (!selectedCourse || !selectedLesson) {
      alert("Select course & lesson first");
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    const updated = courses.map((c) => {
      if (c.id === selectedCourse) {
        return {
          ...c,
          lessons: c.lessons.map((l) =>
            l.id === selectedLesson ? { ...l, content: html } : l
          ),
        };
      }
      return c;
    });

    saveCourses(updated);
    alert("Lesson uploaded!");
  };

  // ================= QUIZ PARSER =================
  const parseQuiz = () => {
    const blocks = input.split(/\n(?=Q\d+\.)/);

    const questions: QuizQuestion[] = [];
    const romanMap = ["I", "II", "III", "IV"];

    blocks.forEach((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 5) return;

      let questionText = "";
      let options: string[] = [];
      let correctIndex = 0;

      lines.forEach((line) => {
        if (
          line.startsWith("Q") ||
          line.startsWith("With") ||
          line.startsWith("In") ||
          line.startsWith("Which")
        ) {
          questionText += line + " ";
        } else if (/^[A-D]\./.test(line)) {
          questionText += line + " ";
        } else if (/^\([IVX]+\)/.test(line)) {
          options.push(line.replace(/^\([IVX]+\)\s*/, ""));
        } else if (line.toLowerCase().includes("correct answer")) {
          const match = line.match(/\((I|II|III|IV)\)/);
          if (match) {
            correctIndex = romanMap.indexOf(match[1]);
          }
        }
      });

      questions.push({
        question: questionText.trim(),
        options,
        correctIndex,
      });
    });

    setParsedQuestions(questions);
  };

  // ================= SAVE QUIZ =================
  const saveQuiz = () => {
    if (!selectedCourse || !selectedLesson) {
      alert("Select course & lesson");
      return;
    }

    const existing = JSON.parse(
      localStorage.getItem("learn_hub_quizzes") || "{}"
    );

    if (!existing[selectedCourse]) {
      existing[selectedCourse] = {};
    }

    existing[selectedCourse][selectedLesson] = parsedQuestions;

    localStorage.setItem("learn_hub_quizzes", JSON.stringify(existing));

    alert("Quiz saved!");
  };

  // ================= UI =================
  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Panel</h2>

      <input
        value={newCourse}
        onChange={(e) => setNewCourse(e.target.value)}
        placeholder="New Course"
      />
      <button onClick={addCourse}>Add Course</button>

      <div>
        <select
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setSelectedLesson("");
          }}
        >
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <input
        value={newLesson}
        onChange={(e) => setNewLesson(e.target.value)}
        placeholder="New Lesson"
      />
      <button onClick={addLesson}>Add Lesson</button>

      <select
        value={selectedLesson}
        onChange={(e) => setSelectedLesson(e.target.value)}
      >
        <option value="">Select Lesson</option>
        {courses
          .find((c) => c.id === selectedCourse)
          ?.lessons?.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
      </select>

      <div style={{ marginTop: 10 }}>
        <input
          type="file"
          accept=".docx"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleDocxUpload(e.target.files[0]);
            }
          }}
        />
      </div>

      <textarea
        rows={10}
        style={{ width: "100%", marginTop: 10 }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste quiz..."
      />

      <button onClick={parseQuiz}>Preview</button>
      <button onClick={saveQuiz}>Add Quiz</button>

      <h3>Preview ({parsedQuestions.length})</h3>
    </div>
  );
}