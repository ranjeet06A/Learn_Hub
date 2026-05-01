export interface StudentProgress {
  courseId: number;
  lessonId: number;
  lessonTitle: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  timeSpent: number; // in seconds
}

export interface StudentStats {
  totalLessonsCompleted: number;
  averageScore: number;
  totalTimeSpent: number;
  progressBycourse: Record<number, { completed: number; score: number }>;
}

const STORAGE_KEY_PREFIX = "learn_hub_student_progress_";

const getStorageKey = (userId: string) => `${STORAGE_KEY_PREFIX}${userId}`;

export const progressManager = {
  // Save a lesson's progress
  saveProgress: (userId: string, progress: StudentProgress) => {
    const allProgress = progressManager.getAllProgress(userId);
    
    // Check if this lesson was already completed
    const existingIndex = allProgress.findIndex(
      (p) => p.courseId === progress.courseId && p.lessonId === progress.lessonId
    );

    if (existingIndex >= 0) {
      // Update existing progress with better score
      if (progress.score > allProgress[existingIndex].score) {
        allProgress[existingIndex] = progress;
      }
    } else {
      // Add new progress
      allProgress.push(progress);
    }

    localStorage.setItem(getStorageKey(userId), JSON.stringify(allProgress));
  },

  // Get all student progress
  getAllProgress: (userId: string): StudentProgress[] => {
    const stored = localStorage.getItem(getStorageKey(userId));
    return stored ? JSON.parse(stored) : [];
  },

  // Get progress for a specific course
  getCourseProgress: (userId: string, courseId: number): StudentProgress[] => {
    return progressManager.getAllProgress(userId).filter((p) => p.courseId === courseId);
  },

  // Get overall stats
  getStats: (userId: string): StudentStats => {
    const allProgress = progressManager.getAllProgress(userId);
    const progressByCourseLegion: Record<
      number,
      { completed: number; score: number }
    > = {};

    allProgress.forEach((p) => {
      if (!progressByCourseLegion[p.courseId]) {
        progressByCourseLegion[p.courseId] = { completed: 0, score: 0 };
      }
      progressByCourseLegion[p.courseId].completed += 1;
      progressByCourseLegion[p.courseId].score += p.score;
    });

    const averageScore =
      allProgress.length > 0
        ? allProgress.reduce((sum, p) => sum + (p.score / p.totalQuestions) * 100, 0) /
          allProgress.length
        : 0;

    const totalTimeSpent = allProgress.reduce((sum, p) => sum + p.timeSpent, 0);

    return {
      totalLessonsCompleted: allProgress.length,
      averageScore: Math.round(averageScore),
      totalTimeSpent,
      progressByCourseLegion,
    };
  },

  // Clear all progress
  clearProgress: (userId: string) => {
    localStorage.removeItem(getStorageKey(userId));
  },

  // Export progress as JSON
  exportProgress: (userId: string): string => {
    const allProgress = progressManager.getAllProgress(userId);
    return JSON.stringify(allProgress, null, 2);
  },

  // Get completed courses
  getCompletedCourses: (userId: string): number[] => {
    const allProgress = progressManager.getAllProgress(userId);
    const courseIds = new Set(allProgress.map((p) => p.courseId));
    return Array.from(courseIds);
  },
};
