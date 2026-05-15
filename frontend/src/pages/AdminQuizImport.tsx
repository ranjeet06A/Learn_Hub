import { useState } from "react";
import { convertToQuizJSON } from "../utils/quizConverter";

export default function AdminQuizImport() {
  const [input, setInput] =
    useState("");

  const [quizData, setQuizData] =
    useState<any[]>([]);

  const [lessonId, setLessonId] =
    useState("");

  // ✅ NEW
  const [quizTitle, setQuizTitle] =
    useState("");

  // =========================
  // CONVERT
  // =========================
  const handleConvert = () => {
    const result =
      convertToQuizJSON(input);

    if (result.length === 0) {
      alert(
        "❌ No valid questions detected"
      );

      return;
    }

    setQuizData(result);
  };

  // =========================
  // IMPORT
  // =========================
  const handleImport = () => {
    if (!lessonId.trim()) {
      alert(
        "⚠️ Enter Lesson ID"
      );

      return;
    }

    if (!quizTitle.trim()) {
      alert(
        "⚠️ Enter Quiz Title"
      );

      return;
    }

    if (quizData.length === 0) {
      alert(
        "⚠️ No quiz data to import"
      );

      return;
    }

    // =========================
    // GET EXISTING
    // =========================
    const existing =
      JSON.parse(
        localStorage.getItem(
          "quizData"
        ) || "{}"
      );

    // lesson structure
    if (
      !existing[lessonId]
    ) {
      existing[lessonId] = [];
    }

   // ✅ FORMAT QUESTIONS
const formattedQuestions =
  quizData.map((q: any) => ({
    questionTitle:
      q.questionTitle ||
      q.question ||
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
        q.correctIndex || 0
      ),
  }));

// ✅ CREATE NEW QUIZ SET
const newQuizSet = {
  title:
    quizTitle,

  questions:
    formattedQuestions,
};

    // ✅ ADD NEW QUIZ
    existing[
      lessonId
    ].push(
      newQuizSet
    );

    // =========================
    // SAVE
    // =========================
    const oldQuizData = JSON.parse(
  localStorage.getItem("quizData") || "{}"
);

oldQuizData[lessonId] = [
  {
    title: "Quiz 1",
    questions: quizData,
  },
];

localStorage.setItem(
  "quizData",
  JSON.stringify(oldQuizData)
);

console.log(
  "UPDATED quizData:",
  oldQuizData
);

    // =========================
    // RESET
    // =========================
    setInput("");

    setQuizData([]);

    setQuizTitle("");
  };

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <h1>
        🧠 ICAI Quiz Import
        Panel
      </h1>

      {/* INPUT */}
      <textarea
        rows={15}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border:
            "1px solid #ccc",
        }}
        placeholder="Paste ICAI questions here..."
        value={input}
        onChange={(e) =>
          setInput(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <button
        onClick={
          handleConvert
        }
        style={{
          padding:
            "12px 20px",
          background:
            "#667eea",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight:
            "bold",
        }}
      >
        🔄 Convert
      </button>

      {/* PREVIEW */}
      {quizData.length >
        0 && (
        <>
          <h3
            style={{
              marginTop: 30,
            }}
          >
            📊 Preview (
            {
              quizData.length
            }{" "}
            Questions)
          </h3>

          <div
            style={{
              background:
                "#111",
              color: "#0f0",
              padding: 15,
              maxHeight:
                "300px",
              overflow:
                "auto",
              borderRadius: 8,
            }}
          >
            {quizData.map(
              (
                q,
                i
              ) => (
                <div
                  key={
                    i
                  }
                  style={{
                    marginBottom: 12,
                  }}
                >
                  <b>
                    Q
                    {i + 1}
                    :
                  </b>{" "}
                  {q.questionTitle ||
                    q.question}
                </div>
              )
            )}
          </div>

          <br />

          {/* LESSON ID */}
          <input
            placeholder="Enter Lesson ID"
            value={
              lessonId
            }
            onChange={(e) =>
              setLessonId(
                e.target.value
              )
            }
            style={{
              width:
                "100%",
              padding: 12,
              borderRadius: 8,
              border:
                "1px solid #ccc",
              marginBottom: 15,
            }}
          />

          {/* QUIZ TITLE */}
          <input
            placeholder="Enter Quiz Title (Example: Quiz 1)"
            value={
              quizTitle
            }
            onChange={(e) =>
              setQuizTitle(
                e.target.value
              )
            }
            style={{
              width:
                "100%",
              padding: 12,
              borderRadius: 8,
              border:
                "1px solid #ccc",
            }}
          />

          <br />
          <br />

          <button
            onClick={
              handleImport
            }
            style={{
              padding:
                "12px 20px",
              background:
                "#16a34a",
              color:
                "white",
              border:
                "none",
              borderRadius: 8,
              cursor:
                "pointer",
              fontWeight:
                "bold",
            }}
          >
            🚀 Import to
            Lesson
          </button>
        </>
      )}

      {/* JSON OUTPUT */}
      <h3
        style={{
          marginTop: 40,
        }}
      >
        📦 JSON Output
      </h3>

      <pre
        style={{
          background:
            "#222",
          color: "#0f0",
          padding: 15,
          overflow:
            "auto",
          borderRadius: 8,
        }}
      >
        {JSON.stringify(
          quizData,
          null,
          2
        )}
      </pre>
    </div>
  );
}