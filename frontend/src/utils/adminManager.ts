// ================= TYPES =================
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

// ================= STORAGE KEYS =================
const COURSES_STORAGE_KEY = "learn_hub_courses";
const QUIZ_STORAGE_KEY = "learn_hub_quizzes";

// ================= DEFAULT DATA =================
const DEFAULT_COURSES: Course[] = [
  {
    id: 1,
    title: "Mathematics Fundamentals",
    description: "Master basic to advanced math concepts",
    lessons: [
      { id: 1, title: "Addition", content: "2 + 2 = 4" },
      { id: 2, title: "Subtraction", content: "5 - 2 = 3" },
    ],
  },
];

const DEFAULT_QUIZ = {
  1: {
    1: [
      { question: "2 + 2 = ?", options: ["3", "4", "5", "6"], answer: "4" },
    ],
  },
};

// ================= COURSE MANAGER =================
export const courseManager = {
  getAllCourses: (): Course[] => {
    const stored = localStorage.getItem(COURSES_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(DEFAULT_COURSES));
      return DEFAULT_COURSES;
    }
    return JSON.parse(stored);
  },

  addCourse: (course: Course) => {
    const courses = courseManager.getAllCourses();
    const newCourse = {
      ...course,
      id: Date.now(),
    };
    courses.push(newCourse);
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
  },

  getCourseById: (id: number) => {
    return courseManager.getAllCourses().find((c) => c.id === id);
  },

  addLessonToCourse: (courseId: number, lesson: Lesson) => {
    const courses = courseManager.getAllCourses();
    const course = courses.find((c) => c.id === courseId);

    if (!course) return;

    const newLesson = {
      ...lesson,
      id: Date.now(),
    };

    course.lessons.push(newLesson);

    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
  },
};

// ================= QUIZ MANAGER (🔥 FIXED) =================
export const quizManager = {
  getAll: (): any => {
    const stored = localStorage.getItem(QUIZ_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  },

  save: (data: any) => {
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(data));
  },

  // ✅ GET quiz by course + lesson
  getQuiz: (courseId: string, lessonId: string): Quiz[] => {
    const data = quizManager.getAll();
    return data?.[courseId]?.[lessonId] || [];
  },

  // ✅ ADD quiz properly
  addQuiz: (courseId: string, lessonId: string, questions: Quiz[]) => {
    const data = quizManager.getAll();

    if (!data[courseId]) {
      data[courseId] = {};
    }

    if (!data[courseId][lessonId]) {
      data[courseId][lessonId] = [];
    }

    data[courseId][lessonId].push(...questions);

    quizManager.save(data);

    console.log("✅ Quiz saved:", data);
  },

  deleteQuiz: (courseId: number, lessonId: number, index: number) => {
    const data = quizManager.getAll();

    if (data?.[courseId]?.[lessonId]) {
      data[courseId][lessonId].splice(index, 1);
      quizManager.save(data);
    }
  },
};