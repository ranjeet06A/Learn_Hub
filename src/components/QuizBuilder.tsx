import React, { useState } from "react";
import { parseQuizData, validateAnswers, QuizQuestion } from "../utils/quizParser";
import { lessonsData } from "../data/lessons";

export const QuizBuilder: React.FC = () => {
  const [pastedContent, setPastedContent] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [parsedQuestions, setParsedQuestions] = useState<QuizQuestion[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState<"input" | "preview">("input");

  const courseIds = Object.keys(lessonsData).map(Number);

  // 📥 HANDLE INPUT
  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPastedContent(e.target.value);
    setSuccess(false);
  };

  // 🔍 PARSE QUIZ
  const handleParse = () => {
    if (!pastedContent.trim()) {
      setErrors(["Please paste quiz questions first"]);
      return;
    }

    const result = parseQuizData(pastedContent);

    if (result.success && result.questions.length > 0) {
      const validationErrors = validateAnswers(result.questions);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setSuccess(false);
      } else {
        setParsedQuestions(result.questions);
        setErrors([]);
        setSuccess(true);
        setMode("preview");
      }
    } else {
      setErrors(result.errors.length ? result.errors : ["Failed to parse"]);
      setParsedQuestions([]);
      setSuccess(false);
    }
  };

  // ✅ FINAL SAVE (APPEND + FIXED)
 console.log("🚀 SAVE BUTTON CLICKED");
  const handleAddQuiz = () => {
    if (!selectedCourse || !selectedLesson) {
      setErrors(["Please select both course and lesson"]);
      return;
    }

    if (parsedQuestions.length === 0) {
      setErrors(["No questions to add"]);
      return;
    }

    const existing = JSON.parse(localStorage.getItem("quizData") || "{}");

    const lessonId = Number(selectedLesson);

    const oldQuestions: QuizQuestion[] = existing[lessonId] || [];

    // ✅ MERGE (NO DUPLICATES)
    const merged = [
      ...oldQuestions,
      ...parsedQuestions.filter(
        (q) =>
          !oldQuestions.some(
            (old) => old.question.trim() === q.question.trim()
          )
      ),
    ];

    existing[lessonId] = merged;

    localStorage.setItem("quizData", JSON.stringify(existing));

    console.log("✅ FINAL SAVED DATA:", existing);

    alert(`✅ ${parsedQuestions.length} questions added!`);

    // 🔥 FORCE UPDATE
    window.location.reload();
  };

  return (
    <div>
      <h2>📝 Quiz Builder</h2>

      {/* MODE */}
      <button onClick={() => setMode("input")}>Input</button>
      <button onClick={() => setMode("preview")}>
        Preview ({parsedQuestions.length})
      </button>

      {/* INPUT */}
      {mode === "input" && (
        <>
          <textarea
            value={pastedContent}
            onChange={handlePaste}
            rows={10}
            style={{ width: "100%" }}
          />
          <button onClick={handleParse}>Parse</button>
        </>
      )}

      {/* PREVIEW */}
      {mode === "preview" && (
        <>
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedLesson("");
            }}
          >
            <option value="">Select Course</option>
            {courseIds.map((c) => (
              <option key={c} value={c}>
                Course {c}
              </option>
            ))}
          </select>

          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
          >
            <option value="">Select Lesson</option>
            {selectedCourse &&
              lessonsData[Number(selectedCourse)]?.map((l: any) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
          </select>

          {/* QUESTIONS */}
          {parsedQuestions.map((q, i) => (
            <div key={i}>
              <p>{i + 1}. {q.question}</p>
              {q.options.map((opt, j) => (
                <div key={j}>
                  {opt} {opt === q.answer ? "✅" : ""}
                </div>
              ))}
            </div>
          ))}

          <button onClick={handleAddQuiz}>
            ✅ Save Quiz
          </button>
        </>
      )}

      {/* ERRORS */}
      {errors.map((e, i) => (
        <p key={i} style={{ color: "red" }}>{e}</p>
      ))}

      {success && <p>✅ Parsed {parsedQuestions.length} questions</p>}
    </div>
  );
};