import React, { useState } from "react";
import { lessonsData } from "../data/lessons";

// ================= TYPES =================
type ParsedQuestion = {
  question: string;
  statements: string[];
  options: string[];
  answer: string;
};

type SavedQuestion = {
  questionTitle: string;
  statements: string[];
  options: string[];
  correctIndex: number;
};

type Props = {
  onAddQuiz?: (
    lessonId: string,
    questions: SavedQuestion[]
  ) => void;
};

const roman = ["I", "II", "III", "IV"];

// ================= COMPONENT =================
const QuizBuilder: React.FC<Props> = () => {
  const [pastedContent, setPastedContent] =
    useState("");

  const [selectedLesson, setSelectedLesson] =
    useState("");

  const [selectedCourse, setSelectedCourse] =
    useState("");

  const [parsedQuestions, setParsedQuestions] =
    useState<ParsedQuestion[]>([]);

  const [errors, setErrors] = useState<
    string[]
  >([]);

  const [success, setSuccess] =
    useState(false);

  const [mode, setMode] = useState<
    "input" | "preview"
  >("input");

  // ================= PARSER =================
  const parseQuiz = (
    text: string
  ): ParsedQuestion[] => {
    const blocks = text
  .split(
    /\n\s*(?:Q\s*)?\d+[\.\)]\s*/i
  )
  .filter(
    (b) => b.trim().length > 20
  );
    return blocks.map((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      let question = "";

      const statements: string[] = [];

      const options: string[] = [];

      let answer = "";

      lines.forEach((line) => {
       // OPTIONS
if (
  /^\((I|II|III|IV)\)/.test(line)
) {
  options.push(
    line.replace(
      /^\((I|II|III|IV)\)\s*/,
      ""
    )
  );
}

// CORRECT ANSWER
else if (
  /Correct Answer/i.test(line)
) {
  const match =
    line.match(
      /\((I|II|III|IV)\)/
    );

  if (match) {
    answer = match[1];
  }
}

// STATEMENTS
else if (
  /^[A-D]\./.test(line) ||
  /^\d+\./.test(line)
) {
  statements.push(line);
}

// QUESTION TITLE
else {
  if (question.length === 0) {
  question = line;
}
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

  // ================= PARSE =================
  const handleParse = () => {
    if (!pastedContent.trim()) {
      setErrors([
        "Please paste questions",
      ]);
      return;
    }

    try {
      const result =
        parseQuiz(pastedContent);

      console.log(
        "PARSED QUESTIONS:",
        result
      );

      if (result.length > 0) {
        setParsedQuestions(result);

        setErrors([]);

        setSuccess(true);

        setMode("preview");
      } else {
        setErrors([
          "No questions parsed",
        ]);

        setSuccess(false);
      }
    } catch (err) {
      console.error(err);

      setErrors(["Parsing failed"]);
    }
  };

  // ================= SAVE QUIZ =================
  const handleAddQuiz = () => {
    if (
      !selectedCourse ||
      !selectedLesson
    ) {
      setErrors([
        "Please select course and lesson",
      ]);

      return;
    }

    if (parsedQuestions.length === 0) {
      setErrors(["No questions found"]);

      return;
    }

    const existing = JSON.parse(
      localStorage.getItem("quizData") ||
        "{}"
    );

    const convertedQuestions: SavedQuestion[] =
      parsedQuestions.map((q) => ({
        questionTitle: q.question,

        statements: q.statements,

        options: q.options,

        correctIndex:
          roman.indexOf(q.answer),
      }));

    existing[selectedLesson] = [
      {
        title: `Quiz 1`,
        questions: convertedQuestions,
      },
    ];

    localStorage.setItem(
      "quizData",
      JSON.stringify(existing)
    );

    console.log(
      "FINAL QUIZ DATA:",
      existing
    );

    alert(
      `✅ ${convertedQuestions.length} questions added`
    );

    window.location.reload();
  };

  // ================= UI =================
  return (
    <div style={{ padding: "30px" }}>
      <h2>📝 Quiz Builder</h2>

      {/* MODE BUTTONS */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() =>
            setMode("input")
          }
        >
          Input
        </button>

        <button
          onClick={() =>
            setMode("preview")
          }
        >
          Preview (
          {parsedQuestions.length})
        </button>
      </div>

      {/* INPUT */}
      {mode === "input" && (
        <div>
          <textarea
            rows={15}
            style={{
              width: "100%",
            }}
            value={pastedContent}
            onChange={(e) =>
              setPastedContent(
                e.target.value
              )
            }
          />

          <br />

          <button
            onClick={handleParse}
          >
            Parse Questions
          </button>
        </div>
      )}

      {/* PREVIEW */}
      {mode === "preview" && (
        <div>
          {/* SELECTORS */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {/* COURSE */}
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(
                  e.target.value
                );

                setSelectedLesson("");
              }}
            >
              <option value="">
                Select Course
              </option>

              {Object.keys(
                lessonsData
              ).map((c) => (
                <option
                  key={c}
                  value={c}
                >
                  Course {c}
                </option>
              ))}
            </select>

            {/* LESSON */}
            <select
              value={selectedLesson}
              onChange={(e) =>
                setSelectedLesson(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Lesson
              </option>

              {selectedCourse &&
                lessonsData[
                  Number(
                    selectedCourse
                  )
                ]?.map((l: any) => (
                  <option
                    key={l.id}
                    value={l.id}
                  >
                    {l.title}
                  </option>
                ))}
            </select>
          </div>

          {/* QUESTIONS */}
          <h3>
            Questions Preview (
            {parsedQuestions.length})
          </h3>

          {parsedQuestions.map(
            (q, idx) => (
              <div
                key={idx}
                style={{
                  background:
                    "#f8f9fa",

                  padding: "15px",

                  marginBottom:
                    "20px",

                  borderRadius:
                    "8px",
                }}
              >
                <h4>
                  Q{idx + 1}.{" "}
                  {q.question}
                </h4>

                {/* STATEMENTS */}
                {q.statements.map(
                  (s, i) => (
                    <div key={i}>
                      {s}
                    </div>
                  )
                )}

                <br />

                {/* OPTIONS */}
                {q.options.map(
                  (opt, i) => (
                    <div key={i}>
                      ({roman[i]}){" "}
                      {opt}
                    </div>
                  )
                )}

                <br />

                <div
                  style={{
                    color: "green",
                    fontWeight:
                      "bold",
                  }}
                >
                  Correct Answer: (
                  {q.answer})
                </div>
              </div>
            )
          )}

          {/* BUTTONS */}
          <div
            style={{
              marginTop: "20px",
            }}
          >
            <button
              onClick={() =>
                setMode("input")
              }
            >
              ← Back
            </button>

            <button
              onClick={handleAddQuiz}
            >
              ✅ Save Quiz
            </button>
          </div>
        </div>
      )}

      {/* ERRORS */}
      {errors.map((e, i) => (
        <p
          key={i}
          style={{
            color: "red",
          }}
        >
          {e}
        </p>
      ))}

      {/* SUCCESS */}
      {success && (
        <p
          style={{
            color: "green",
          }}
        >
          ✅ Parsed{" "}
          {parsedQuestions.length}{" "}
          questions
        </p>
      )}
    </div>
  );
};

export default QuizBuilder;