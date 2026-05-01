export interface Enrollment {
  courseId: number;
  enrolledAt: string;
  completedLessons: number[];
}

const STORAGE_KEY_PREFIX = "learn_hub_enrollments_";

const getStorageKey = (userId: string) => `${STORAGE_KEY_PREFIX}${userId}`;

export const enrollmentManager = {
  // Enroll user in a course
  enrollCourse: (userId: string, courseId: number) => {
    const enrollments = enrollmentManager.getAllEnrollments(userId);
    
    // Check if already enrolled
    if (enrollments.some((e) => e.courseId === courseId)) {
      return { success: false, message: "Already enrolled in this course" };
    }

    enrollments.push({
      courseId,
      enrolledAt: new Date().toISOString(),
      completedLessons: [],
    });

    localStorage.setItem(getStorageKey(userId), JSON.stringify(enrollments));
    return { success: true, message: "Successfully enrolled in course" };
  },

  // Unenroll user from a course
  unenrollCourse: (userId: string, courseId: number) => {
    const enrollments = enrollmentManager.getAllEnrollments(userId);
    const filtered = enrollments.filter((e) => e.courseId !== courseId);
    
    if (filtered.length === enrollments.length) {
      return { success: false, message: "Not enrolled in this course" };
    }

    localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
    return { success: true, message: "Successfully unenrolled from course" };
  },

  // Check if user is enrolled in a course
  isEnrolled: (userId: string, courseId: number): boolean => {
    const enrollments = enrollmentManager.getAllEnrollments(userId);
    return enrollments.some((e) => e.courseId === courseId);
  },

  // Get all enrolled courses for a user
  getAllEnrollments: (userId: string): Enrollment[] => {
    const stored = localStorage.getItem(getStorageKey(userId));
    return stored ? JSON.parse(stored) : [];
  },

  // Get enrolled course IDs
  getEnrolledCourseIds: (userId: string): number[] => {
    return enrollmentManager.getAllEnrollments(userId).map((e) => e.courseId);
  },

  // Get enrollment details for a course
  getEnrollment: (userId: string, courseId: number): Enrollment | null => {
    const enrollments = enrollmentManager.getAllEnrollments(userId);
    return enrollments.find((e) => e.courseId === courseId) || null;
  },

  // Mark lesson as completed in an enrolled course
  markLessonCompleted: (userId: string, courseId: number, lessonId: number) => {
    const enrollments = enrollmentManager.getAllEnrollments(userId);
    const enrollment = enrollments.find((e) => e.courseId === courseId);

    if (!enrollment) {
      return { success: false, message: "Not enrolled in this course" };
    }

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    localStorage.setItem(getStorageKey(userId), JSON.stringify(enrollments));
    return { success: true, message: "Lesson marked as completed" };
  },

  // Get completed lessons for an enrolled course
  getCompletedLessons: (userId: string, courseId: number): number[] => {
    const enrollment = enrollmentManager.getEnrollment(userId, courseId);
    return enrollment?.completedLessons || [];
  },

  // Get enrollment stats
  getEnrollmentStats: (userId: string) => {
    const enrollments = enrollmentManager.getAllEnrollments(userId);
    return {
      totalEnrolled: enrollments.length,
      enrollments,
    };
  },

  // Clear all enrollments for a user
  clearEnrollments: (userId: string) => {
    localStorage.removeItem(getStorageKey(userId));
  },
};
