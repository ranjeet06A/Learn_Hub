/**
 * Quiz Manager
 * Manages quiz data for lessons
 */

// ✅ FIX: Define QuizQuestion properly (instead of broken import)
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface QuizDataStructure {
  [lessonId: number]: QuizQuestion[];
}

/**
 * Add quiz questions to a specific lesson
 * Returns a function that can be used to update the Quiz.ts file
 */
export function generateQuizCode(
  quizData: QuizDataStructure
): string {
  return `export const quizData = ${JSON.stringify(quizData, null, 2)};`;
}

/**
 * Add questions to an existing lesson's quiz
 */
export function addQuestionsToLesson(
  currentQuizData: QuizDataStructure,
  lessonId: number,
  newQuestions: QuizQuestion[]
): QuizDataStructure {
  return {
    ...currentQuizData,
    [lessonId]: [...(currentQuizData[lessonId] || []), ...newQuestions],
  };
}

/**
 * Replace quiz questions for a lesson
 */
export function replaceQuestionsForLesson(
  currentQuizData: QuizDataStructure,
  lessonId: number,
  newQuestions: QuizQuestion[]
): QuizDataStructure {
  return {
    ...currentQuizData,
    [lessonId]: newQuestions,
  };
}

/**
 * Get quiz for a specific lesson
 */
export function getQuizForLesson(
  quizData: QuizDataStructure,
  lessonId: number
): QuizQuestion[] {
  return quizData[lessonId] || [];
}

/**
 * Export quiz data as JSON for backup
 */
export function exportQuizDataAsJson(quizData: QuizDataStructure): string {
  return JSON.stringify(quizData, null, 2);
}

/**
 * Generate sample quiz code for reference
 */
export function generateSampleQuizCode(): string {
  const sampleData: QuizDataStructure = {
    1: [
      {
        question: "2 + 2 = ?",
        options: ["3", "4", "5", "6"],
        answer: "4",
      },
      {
        question: "15 - 2 = ?",
        options: ["13", "14", "15", "16"],
        answer: "13",
      },
    ],
    2: [
      {
        question: "What is the SI unit of force?",
        options: ["Newton", "Joule", "Watt", "Pascal"],
        answer: "Newton",
      },
    ],
  };

  return generateQuizCode(sampleData);
}