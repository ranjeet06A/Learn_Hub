// ================= TYPES =================
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

// ================= MAIN PARSER =================
export function parseQuiz(text: string): QuizQuestion[] {
  const questions = text.split(/Q\d+\./).filter(Boolean);

  return questions.map((block) => {
    const lines = block.trim().split("\n").map((l) => l.trim());

    let questionText = "";
    let options: string[] = [];
    let correctIndex = 0;

    const optionMap: Record<string, number> = {
      "(I)": 0,
      "(II)": 1,
      "(III)": 2,
      "(IV)": 3,
    };

    lines.forEach((line) => {
      // 🟢 QUESTION TEXT
      if (
        line.startsWith("With") ||
        line.startsWith("In") ||
        line.startsWith("Which")
      ) {
        questionText += line + " ";
      }

      // 🟢 STATEMENTS (A. B. C. D.)
      else if (/^[A-D]\./.test(line)) {
        questionText += line + " ";
      }

      // 🟢 OPTIONS (I)(II)(III)(IV)
      else if (/^\(I\)|^\(II\)|^\(III\)|^\(IV\)/.test(line)) {
        const clean = line.replace(/^\(\w+\)\s*/, "");
        options.push(clean);
      }

      // 🟢 CORRECT ANSWER
      else if (line.includes("Correct Answer")) {
        const match = line.match(/\(\w+\)/);
        if (match) {
          correctIndex = optionMap[match[0]];
        }
      }
    });

    return {
      question: questionText.trim(),
      options,
      answer: options[correctIndex] || "",
    };
  });
}

// ================= FIXED FOR UI =================
export function parseQuizData(text: string): {
  success: boolean;
  questions: QuizQuestion[];
  errors: string[];
} {
  try {
    const questions = parseQuiz(text);

    if (!questions.length) {
      return {
        success: false,
        questions: [],
        errors: ["No questions parsed"],
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
      errors: ["Parsing failed"],
    };
  }
}

// ================= VALIDATION =================
export function validateAnswers(questions: QuizQuestion[]): string[] {
  const errors: string[] = [];

  questions.forEach((q, i) => {
    if (!q.answer || !q.options.includes(q.answer)) {
      errors.push(`Question ${i + 1} has invalid answer`);
    }
  });

  return errors;
}