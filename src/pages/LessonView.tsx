import { useState, useEffect } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { progressManager } from "../utils/progressManager";
import { courseManager, quizManager } from "../utils/adminManager";
import { authManager } from "../utils/authManager";

export default function LessonView() {
    

  const { id, lessonId } = useParams();
  const navigate = useNavigate();
  const [answered, setAnswered] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30); // 30 seconds
  const [quizStartTime] = useState(Date.now());
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const currentUser = authManager.getCurrentUser();

  useEffect(() => {
  if (time === 0) return;

  const timer = setInterval(() => {
    setTime((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);

}, [time]);

  const course = courseManager.getCourseById(Number(id));
  const lessons = course?.lessons || [];
  const currentIndex = lessons.findIndex((l) => l.id === Number(lessonId));
  const lesson = lessons[currentIndex];
  const quizItems = quizManager.getQuizByCourse(Number(id)) || [];

  // Save progress when time runs out
  useEffect(() => {
    if (time === 0 && !isQuizCompleted && lesson && currentUser) {
      const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
      
      progressManager.saveProgress(currentUser.id, {
        courseId: Number(id),
        lessonId: Number(lessonId),
        lessonTitle: lesson.title,
        score,
        totalQuestions: quizItems.length,
        completedAt: new Date().toISOString(),
        timeSpent,
      });

      setIsQuizCompleted(true);
    }
  }, [time, isQuizCompleted, lesson, score, quizItems.length, id, lessonId, quizStartTime]);

  if (!lesson) return <h2>Lesson not found</h2>;

  const nextLesson = lessons[currentIndex + 1];
  const prevLesson = lessons[currentIndex - 1];

  return (
    <div style={{ padding: "30px" }}>
      <h1>{lesson.title}</h1>
      <p style={{ marginTop: "10px" }}>{lesson.content}</p>

      <h3>⏱ Time Left: {time}s</h3>

      <div style={{ marginTop: "20px" }}>
        {prevLesson && (
          <button onClick={() => navigate(`/course/${id}/lesson/${prevLesson.id}`)}>
            Previous
          </button>
        )}

        {nextLesson && (
          <button
            onClick={() => navigate(`/course/${id}/lesson/${nextLesson.id}`)}
            style={{ marginLeft: "10px" }}
          >
            Next
          </button>
        )}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>📝 Quiz</h2>
        {quizItems.length === 0 ? (
          <p>No quiz available for this lesson.</p>
        ) : (
          quizItems.map((q, index) => (
            <div key={index} style={{ marginTop: "15px" }}>
              <p>{q.question}</p>
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  style={{ display: "block", marginTop: "5px" }}
                  disabled={answered[index] || time === 0}
                  onClick={() => {
                    if (answered[index] || time === 0) return;

                    if (opt === q.answer) {
                      setScore(score + 1);
                    }

                    setAnswered({ ...answered, [index]: true });
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          ))
        )}

        <h3 style={{ marginTop: "20px" }}>Score: {score}</h3>
      </div>

      {time === 0 && (
        <h2 style={{ color: "green", marginTop: "20px" }}>
          🎉 Time's up! Your Score: {score}
        </h2>
      )}
    </div>
  );
}
