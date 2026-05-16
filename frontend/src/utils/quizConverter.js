export function convertToQuizJSON(input: string) {
  const questions: any[] = [];

  // =========================
  // NORMALIZE
  // =========================
  input = input.replace(/\r/g, "");

  // Support Q1. and 1.
  input = input.replace(
    /(?:^|\n)(Q?\d+\.)/g,
    "\n###QUESTION###$1"
  );

  // =========================
  // SPLIT QUESTIONS
  // =========================
  const blocks = input
    .split("###QUESTION###")
    .map((b) => b.trim())
    .filter(Boolean);

  // =========================
  // PROCESS BLOCKS
  // =========================
  blocks.forEach((block) => {
    try {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length === 0) {
        return;
      }

      // =========================
      // QUESTION TITLE
      // =========================
      const questionTitle =
        lines[0].replace(
          /^Q?\d+\.\s*/,
          ""
        );

      const statements: string[] =
        [];

      const options: string[] = [];

      let correctIndex = 0;

      // =========================
      // PARSE LINES
      // =========================
      lines.forEach((line) => {
        // Statements
        const statementMatch =
          line.match(
            /^\d+\.\s*(.*)/
          );

        if (
          statementMatch &&
          !line
            .toLowerCase()
            .includes(
              "correct answer"
            )
        ) {
          statements.push(
            statementMatch[1].trim()
          );
        }

        // Options
        const optionMatch =
          line.match(
            /^\(([A-D]|I|II|III|IV)\)\s*(.*)/
          );

        if (optionMatch) {
          options.push(
            optionMatch[2].trim()
          );
        }

        // Correct answer
        if (
          line
            .toLowerCase()
            .includes(
              "correct answer"
            )
        ) {
          const ansMatch =
            line.match(
              /\(([A-D]|I|II|III|IV)\)/
            );

          if (ansMatch) {
            const key =
              ansMatch[1];

            const map: any = {
              A: 0,
              B: 1,
              C: 2,
              D: 3,
              I: 0,
              II: 1,
              III: 2,
              IV: 3,
            };

            correctIndex =
              map[key] || 0;
          }
        }
      });

      // =========================
      // SAVE QUESTION
      // =========================
      if (
        questionTitle &&
        options.length >= 2
      ) {
        questions.push({
          questionTitle,
          statements,
          options,
          correctIndex,
        });
      }
    } catch (err) {
      console.error(
        "Quiz parse error:",
        err
      );
    }
  });

  console.log(
    "FINAL CONVERTED QUESTIONS:",
    questions
  );

  return questions;
}