export function convertToQuizJSON(input) {
  const questions = [];

  // 🔥 STEP 0 — NORMALIZE INPUT (CRITICAL FIX)
  input = input.replace(/Correct Answer:\s*\([IVX]+\)\s*/g, (match) => {
    return match + "\n"; // force newline after answer
  });

  input = input.replace(/(Q\d+\.)/g, "\n$1"); // force new line before Q2, Q3

  // 🔥 STEP 1 — SPLIT QUESTIONS
  let blocks = input.split(/\nQ\d+\./g);

  if (blocks.length === 1) {
    blocks = [input];
  }

  blocks = blocks.map((b) => b.trim()).filter(Boolean);

  blocks.forEach((block) => {
    try {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      let questionText = "";
      let options = [];
      let answer = "";

      // ✅ QUESTION LINE
      questionText = lines[0];

      // ✅ OPTIONS + ANSWER
      lines.forEach((line) => {
        const optMatch = line.match(/^\((I|II|III|IV)\)\s*(.*)/);

        if (optMatch) {
          options.push(optMatch[2].trim());
        }

        if (line.toLowerCase().includes("correct answer")) {
          const ansMatch = line.match(/\((I|II|III|IV)\)/);
          if (ansMatch) {
            const map = { I: 0, II: 1, III: 2, IV: 3 };
            answer = options[map[ansMatch[1]]];
          }
        }
      });

      // ✅ FINAL PUSH
      if (questionText && options.length === 4) {
        questions.push({
          question: questionText,
          options,
          answer,
        });
      }
    } catch (err) {
      console.error("Parsing error:", err);
    }
  });

  return questions;
}