import { useState } from "react";
import { convertToQuizJSON } from "../utils/quizConverter";

export default function AdminQuizImport() {
  const [input, setInput] = useState("");
  const [quizData, setQuizData] = useState<any[]>([]);
  const [lessonId, setLessonId] = useState("");

  // 🔄 Convert only
  const handleConvert = () => {
    const result = convertToQuizJSON(input);

    if (result.length === 0) {
      alert("❌ No valid questions detected");
      return;
    }

    setQuizData(result);
  };

  // 🚀 Import into system
  const handleImport = () => {
    if (!lessonId.trim()) {
      alert("⚠️ Enter Lesson ID");
      return;
    }

    if (quizData.length === 0) {
      alert("⚠️ No quiz data to import");
      return;
    }

    const existing = JSON.parse(localStorage.getItem("quizData") || "{}");
    const old = existing[lessonId] || [];

    // 🧠 Remove duplicates
    const newQuestions = quizData.filter(
      (q) => !old.some((o: any) => o.question.trim() === q.question.trim())
    );

    existing[lessonId] = [...old, ...newQuestions];

    localStorage.setItem("quizData", JSON.stringify(existing));

    alert(`✅ ${newQuestions.length} Questions Imported Successfully`);

    // reset
    setInput("");
    setQuizData([]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🧠 ICAI Quiz Import Panel</h1>

      {/* 📥 INPUT */}
      <textarea
        rows={15}
        style={{ width: "100%" }}
        placeholder="Paste ICAI questions here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <br /><br />

      <button onClick={handleConvert}>
        🔄 Convert
      </button>

      {/* 📊 PREVIEW */}
      {quizData.length > 0 && (
        <>
          <h3>📊 Preview ({quizData.length} Questions)</h3>

          <div
            style={{
              background: "#111",
              color: "#0f0",
              padding: 10,
              maxHeight: "300px",
              overflow: "auto",
            }}
          >
            {quizData.map((q, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <b>Q{i + 1}:</b> {q.question}
              </div>
            ))}
          </div>

          <br />

          {/* 🎯 LESSON ID */}
          <input
            placeholder="Enter Lesson ID (IMPORTANT)"
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />

          <br /><br />

          <button onClick={handleImport}>
            🚀 Import to Lesson
          </button>
        </>
      )}

      {/* 🧾 DEBUG JSON */}
      <h3>📦 JSON Output</h3>
      <pre style={{ background: "#222", color: "#0f0", padding: 10 }}>
        {JSON.stringify(quizData, null, 2)}
      </pre>
    </div>
  );
}