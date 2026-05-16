export function convertToQuizJSON(
  input: string
) {
  // =========================
  // TRY DIRECT JSON PARSE
  // =========================
  try {
    const parsed =
      JSON.parse(input);

    if (
      Array.isArray(parsed)
    ) {
      console.log(
        "JSON QUIZ DETECTED:",
        parsed
      );

      return parsed;
    }
  } catch (err) {
    console.log(
      "Not JSON format, using text parser..."
    );
  }

  // =========================
  // TEXT PARSER
  // =========================
  const questions: any[] = [];

  input = input.replace(
    /\r/g,
    ""
  );

  input = input.replace(
    /(?:^|\n)(Q?\d+\.)/g,
    "\n###QUESTION###$1"
  );

  const blocks = input
    .split(
      "###QUESTION###"
    )
    .map((b) => b.trim())
    .filter(Boolean);

  blocks.forEach((block) => {
    try {
      const lines = block
        .split("\n")
        .map((l) =>
          l.trim()
        )
        .filter(Boolean);

      if (
        lines.length === 0
      ) {
        return;
      }

      const questionTitle =
        lines[0].replace(
          /^Q?\d+\.\s*/,
          ""
        );

      const statements: string[] =
        [];

      const options: string[] =
        [];

      let correctIndex = 0;

      lines.forEach(
        (line) => {
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

          if (
            optionMatch
          ) {
            options.push(
              optionMatch[2].trim()
            );
          }

          // Correct Answer
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

            if (
              ansMatch
            ) {
              const map: any =
                {
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
                map[
                  ansMatch[1]
                ] || 0;
            }
          }
        }
      );

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
    "FINAL PARSED QUESTIONS:",
    questions
  );

  return questions;
}