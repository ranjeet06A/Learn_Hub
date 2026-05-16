// ================= TYPES =================
export interface QuizQuestion {
  questionTitle: string;
  statements: string[];
  options: string[];
  correctIndex: number;
}

// ================= MAIN PARSER =================
export function parseQuiz(
  text: string
): QuizQuestion[] {
  const blocks = text
    .split(/Q\d+\./)
    .filter(Boolean);

  const questions: QuizQuestion[] =
    [];

  blocks.forEach((block) => {
    const lines = block
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let questionTitle = "";

    const statements: string[] =
      [];

    const options: string[] = [];

    let correctIndex = 0;

    const optionMap: Record<
      string,
      number
    > = {
      I: 0,
      II: 1,
      III: 2,
      IV: 3,
    };

    lines.forEach((line) => {
      // ================= QUESTION =================
      if (
        line.startsWith("With") ||
        line.startsWith("In") ||
        line.startsWith("Which")
      ) {
        questionTitle +=
          line + " ";
      }

      // ================= STATEMENTS =================
      else if (
        /^\d+\./.test(line) ||
        /^[A-D]\./.test(line)
      ) {
        const cleaned =
          line.replace(
            /^\d+\.\s*/,
            ""
          );

        statements.push(cleaned);
      }

      // ================= OPTIONS =================
      else if (
        /^\((I|II|III|IV)\)/.test(
          line
        )
      ) {
        const cleaned =
          line.replace(
            /^\((I|II|III|IV)\)\s*/,
            ""
          );

        options.push(cleaned);
      }

      // ================= CORRECT ANSWER =================
      else if (
        line.includes(
          "Correct Answer"
        )
      ) {
        const match =
          line.match(
            /\((I|II|III|IV)\)/
          );

        if (match) {
          correctIndex =
            optionMap[
              match[1]
            ] ?? 0;
        }
      }
    });

    questions.push({
      questionTitle:
        questionTitle.trim(),

      statements,

      options,

      correctIndex,
    });
  });

  return questions;
}

// ================= FIXED FOR UI =================
export function parseQuizData(
  text: string
): {
  success: boolean;
  questions: QuizQuestion[];
  errors: string[];
} {
  try {
    const questions =
      parseQuiz(text);

    if (!questions.length) {
      return {
        success: false,
        questions: [],
        errors: [
          "No questions parsed",
        ],
      };
    }

    return {
      success: true,
      questions,
      errors: [],
    };
  } catch (err) {
    return {
      success: false,
      questions: [],
      errors: [
        "Parsing failed",
      ],
    };
  }
}

// ================= VALIDATION =================
export function validateAnswers(
  questions: QuizQuestion[]
): string[] {
  const errors: string[] = [];

  questions.forEach((q, i) => {
    if (
      q.correctIndex < 0 ||
      q.correctIndex >
        q.options.length - 1
    ) {
      errors.push(
        `Question ${
          i + 1
        } has invalid answer`
      );
    }
  });

  return errors;
}