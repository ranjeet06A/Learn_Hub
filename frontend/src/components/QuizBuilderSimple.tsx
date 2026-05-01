import React, { useState } from "react";
import { lessonsData } from "../data/lessons";

// ✅ TYPE FOR QUESTIONS
type ParsedQuestion = {
  question: string;
  statements: string[];
  options: string[];
  answer: string;
};

// ✅ PROPS TYPE
type Props = {
  onAddQuiz?: (lessonId: number, questions: ParsedQuestion[]) => void;
};

export const QuizBuilder: React.FC<Props> = ({ onAddQuiz }) => {
  const [pastedContent, setPastedContent] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState<"input" | "preview">("input");

  const roman = ["I", "II", "III", "IV"];

  // ✅ PARSER (TYPED)
  const parseQuiz = (text: string): ParsedQuestion[] => {
    const blocks = text.split(/Q\d+\./).filter(Boolean);

    return blocks.map((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      let question = "";
      let statements: string[] = [];
      let options: string[] = [];
      let answer = "";

      lines.forEach((line: string) => {
        if (/^[A-D]\./.test(line)) {
          statements.push(line);
        } else if (/^\((I{1,3}|IV)\)/.test(line)) {
          options.push(line.replace(/^\((I{1,3}|IV)\)\s*/, ""));
        } else if (/Correct Answer/i.test(line)) {
          const match = line.match(/\((.*?)\)/);
          answer = match ? match[1] : "";
        } else {
          question += line + " ";
        }
      });

      return {
        question: question.trim(),
        statements,
        options,
        answer,
      };
    });
  };

  // ✅ PARSE BUTTON
  const handleParse = () => {
    if (!pastedContent.trim()) {
      setErrors(["Please paste quiz questions first"]);
      return;
    }

    try {
      const result = parseQuiz(pastedContent);

      if (result.length > 0) {
        setParsedQuestions(result);
        setErrors([]);
        setSuccess(true);
        setMode("preview");
      } else {
        setErrors(["Parsing failed"]);
        setParsedQuestions([]);
        setSuccess(false);
      }
    } catch (err) {
      console.error(err);
      setErrors(["Parsing error"]);
      setParsedQuestions([]);
      setSuccess(false);
    }
  };

  // ✅ ADD QUIZ
  const handleAddQuiz = () => {
    if (!selectedCourse || !selectedLesson) {
      setErrors(["Select course and lesson"]);
      return;
    }

    if (parsedQuestions.length === 0) {
      setErrors(["No questions"]);
      return;
    }

    onAddQuiz?.(Number(selectedLesson), parsedQuestions);

    alert(`✅ ${parsedQuestions.length} questions added`);

    setPastedContent("");
    setParsedQuestions([]);
    setErrors([]);
    setSelectedLesson("");
    setSelectedCourse("");
    setMode("input");
    setSuccess(false);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>📝 Quiz Builder</h2>

      {/* MODE */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setMode("input")}>Input</button>
        <button onClick={() => setMode("preview")}>
          Preview ({parsedQuestions.length})
        </button>
      </div>

      {/* INPUT */}
      {mode === "input" && (
        <div>
          <textarea
            value={pastedContent}
            onChange={(e) => setPastedContent(e.target.value)}
            rows={12}
            style={{ width: "100%" }}
          />
          <br />
          <button onClick={handleParse}>Parse</button>
        </div>
      )}

      {/* PREVIEW */}
      {mode === "preview" && (
        <div>
          {/* COURSE + LESSON */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedLesson("");
              }}
            >
              <option value="">Select Course</option>
              {Object.keys(lessonsData).map((c) => (
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
          </div>

          {/* QUESTIONS */}
          <h3>Questions Preview ({parsedQuestions.length})</h3>

          {parsedQuestions.map((q, idx) => {
            const correctIndex = roman.indexOf(q.answer);

            return (
              <div
                key={idx}
                style={{
                  background: "#f8f9fa",
                  padding: "15px",
                  marginBottom: "20px",
                  borderRadius: "6px",
                }}
              >
                <strong>
                  Q{idx + 1}. {q.question}
                </strong>

                {/* STATEMENTS */}
                <div style={{ marginTop: "10px" }}>
                  {q.statements.map((s, i) => (
                    <div key={i}>{s}</div>
                  ))}
                </div>

                <br />

                {/* OPTIONS */}
                {q.options.map((opt, i) => (
                  <div key={i}>
                    ({roman[i]}) {opt}
                  </div>
                ))}

                <br />

                {/* ANSWER */}
                {correctIndex !== -1 && (
                  <div style={{ fontWeight: "bold", color: "green" }}>
                    Correct Answer: ({roman[correctIndex]})
                  </div>
                )}
              </div>
            );
          })}

          {/* BUTTONS */}
          <div style={{ marginTop: "20px" }}>
            <button onClick={() => setMode("input")}>← Back</button>
            <button onClick={handleAddQuiz}>✅ Add Quiz</button>
          </div>
        </div>
      )}

      {/* ERRORS */}
      {errors.map((e, i) => (
        <p key={i} style={{ color: "red" }}>
          {e}
        </p>
      ))}

      {/* SUCCESS */}
      {success && <p>✅ Parsed {parsedQuestions.length} questions</p>}
    </div>
  );
};