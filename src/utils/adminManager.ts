export interface Course {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
}

export interface Quiz {
  question: string;
  options: string[];
  answer: string;
}

const COURSES_STORAGE_KEY = "learn_hub_courses";
const QUIZZES_STORAGE_KEY = "learn_hub_quizzes";

// Default courses if none exist
const DEFAULT_COURSES: Course[] = [
  {
    id: 1,
    title: "Mathematics Fundamentals",
    description: "Master basic to advanced math concepts",
    lessons: [
      { id: 1, title: "Addition", content: "Addition means adding numbers like 2 + 2 = 4" },
      { id: 2, title: "Subtraction", content: "Subtraction means removing numbers like 5 - 2 = 3" },
    ],
  },
  {
    id: 2,
    title: "Physics Essentials",
    description: "Explore the laws of motion and energy",
    lessons: [
      { id: 1, title: "Physics Intro", content: "Physics is the study of motion, force, and energy." },
      { id: 2, title: "Chemistry Intro", content: "Chemistry is the study of matter and reactions." },
    ],
  },
];

const DEFAULT_QUIZZES: Record<number, Quiz[]> = {
  1: [
    { question: "2 + 2 = ?", options: ["3", "4", "5", "6"], answer: "4" },
    { question: "5 - 2 = ?", options: ["2", "3", "4", "5"], answer: "3" },
  ],
};

export const courseManager = {
  // Get all courses
  getAllCourses: (): Course[] => {
    const stored = localStorage.getItem(COURSES_STORAGE_KEY);
    if (!stored) {
      courseManager.initializeCourses();
      return DEFAULT_COURSES;
    }
    return JSON.parse(stored);
  },

  // Initialize with default courses
  initializeCourses: () => {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(DEFAULT_COURSES));
  },

  // Add a new course
  addCourse: (course: Course): Course => {
    const courses = courseManager.getAllCourses();
    const newCourse = { ...course, id: Math.max(...courses.map((c) => c.id), 0) + 1 };
    courses.push(newCourse);
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
    return newCourse;
  },

  // Update course
  updateCourse: (id: number, updatedCourse: Partial<Course>): Course | null => {
    const courses = courseManager.getAllCourses();
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) return null;
    courses[index] = { ...courses[index], ...updatedCourse };
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
    return courses[index];
  },

  // Delete course
  deleteCourse: (id: number): boolean => {
    const courses = courseManager.getAllCourses();
    const filtered = courses.filter((c) => c.id !== id);
    if (filtered.length === courses.length) return false;
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Get course by ID
  getCourseById: (id: number): Course | null => {
    const courses = courseManager.getAllCourses();
    return courses.find((c) => c.id === id) || null;
  },

  // Add lesson to course
  addLessonToCourse: (courseId: number, lesson: Lesson): boolean => {
    const course = courseManager.getCourseById(courseId);
    if (!course) return false;
    const newLesson = { ...lesson, id: Math.max(...course.lessons.map((l) => l.id), 0) + 1 };
    course.lessons.push(newLesson);
    courseManager.updateCourse(courseId, course);
    return true;
  },

  // Delete lesson from course
  deleteLessonFromCourse: (courseId: number, lessonId: number): boolean => {
    const course = courseManager.getCourseById(courseId);
    if (!course) return false;
    course.lessons = course.lessons.filter((l) => l.id !== lessonId);
    courseManager.updateCourse(courseId, course);
    return true;
  },
};

export const quizManager = {
  // Get all quizzes
  getAllQuizzes: (): Record<number, Quiz[]> => {
    const stored = localStorage.getItem(QUIZZES_STORAGE_KEY);
    if (!stored) {
      quizManager.initializeQuizzes();
      return DEFAULT_QUIZZES;
    }
    return JSON.parse(stored);
  },

  // Initialize with default quizzes
  initializeQuizzes: () => {
    localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(DEFAULT_QUIZZES));
  },

  // Get quiz for course
  getQuizByCourse: (courseId: number): Quiz[] => {
    const quizzes = quizManager.getAllQuizzes();
    return quizzes[courseId] || [];
  },

  // Add quiz question to course
  addQuizToCourse: (courseId: number, quiz: Quiz): void => {
    const quizzes = quizManager.getAllQuizzes();
    if (!quizzes[courseId]) {
      quizzes[courseId] = [];
    }
    quizzes[courseId].push(quiz);
    localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(quizzes));
  },

  // Update quiz question
  updateQuiz: (courseId: number, index: number, updatedQuiz: Quiz): void => {
    const quizzes = quizManager.getAllQuizzes();
    if (quizzes[courseId] && quizzes[courseId][index]) {
      quizzes[courseId][index] = updatedQuiz;
      localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(quizzes));
    }
  },

  // Delete quiz question
  deleteQuiz: (courseId: number, index: number): void => {
    const quizzes = quizManager.getAllQuizzes();
    if (quizzes[courseId]) {
      quizzes[courseId].splice(index, 1);
      localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(quizzes));
    }
  },

  // Reset quizzes to default
  resetQuizzes: () => {
    quizManager.initializeQuizzes();
  },
};
