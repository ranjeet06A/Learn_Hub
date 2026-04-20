import { Link } from "react-router-dom";
import { progressManager } from "../utils/progressManager";
import { authManager } from "../utils/authManager";
import { useState, useEffect } from "react";
import type { StudentProgress } from "../utils/progressManager";

export default function Progress() {
  const [allProgress, setAllProgress] = useState<StudentProgress[]>([]);
  const [stats, setStats] = useState({
    totalLessonsCompleted: 0,
    averageScore: 0,
    totalTimeSpent: 0,
  });
  const currentUser = authManager.getCurrentUser();

  useEffect(() => {
    if (!currentUser) return;
    setAllProgress(progressManager.getAllProgress(currentUser.id));
    const statsData = progressManager.getStats(currentUser.id);
    setStats({
      totalLessonsCompleted: statsData.totalLessonsCompleted,
      averageScore: statsData.averageScore,
      totalTimeSpent: statsData.totalTimeSpent,
    });
  }, [currentUser]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const handleClearProgress = () => {
    if (currentUser && window.confirm("Are you sure you want to clear all progress?")) {
      progressManager.clearProgress(currentUser.id);
      setAllProgress([]);
      setStats({
        totalLessonsCompleted: 0,
        averageScore: 0,
        totalTimeSpent: 0,
      });
    }
  };

  const handleAddSampleData = () => {
    if (!currentUser) return;
    // Add some sample progress data for testing
    const sampleData = [
      {
        courseId: 1,
        lessonId: 1,
        lessonTitle: "Addition",
        score: 2,
        totalQuestions: 2,
        completedAt: new Date(Date.now() - 3600000).toISOString(),
        timeSpent: 1800,
      },
      {
        courseId: 1,
        lessonId: 2,
        lessonTitle: "Subtraction",
        score: 1,
        totalQuestions: 2,
        completedAt: new Date(Date.now() - 1800000).toISOString(),
        timeSpent: 1200,
      },
      {
        courseId: 2,
        lessonId: 1,
        lessonTitle: "Physics Intro",
        score: 2,
        totalQuestions: 2,
        completedAt: new Date(Date.now() - 900000).toISOString(),
        timeSpent: 900,
      },
    ];

    sampleData.forEach((data) => progressManager.saveProgress(currentUser.id, data));
    setAllProgress(progressManager.getAllProgress(currentUser.id));
    const statsData = progressManager.getStats(currentUser.id);
    setStats({
      totalLessonsCompleted: statsData.totalLessonsCompleted,
      averageScore: statsData.averageScore,
      totalTimeSpent: statsData.totalTimeSpent,
    });
  };

  const handleExportProgress = () => {
    if (!currentUser) return;
    const data = progressManager.exportProgress(currentUser.id);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `progress_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "40px 30px",
        }}
      >
        <Link to="/" style={{ textDecoration: "none", color: "white" }}>
          <button
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            ← Back to Dashboard
          </button>
        </Link>
        <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>📊 Your Learning Progress</h1>
        <p style={{ opacity: 0.9 }}>Track your scores and learning journey</p>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 30px" }}>
        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "10px" }}>Lessons Completed</p>
            <h3 style={{ fontSize: "36px", fontWeight: "700", color: "#667eea", margin: 0 }}>
              {stats.totalLessonsCompleted}
            </h3>
          </div>

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "10px" }}>Average Score</p>
            <h3 style={{ fontSize: "36px", fontWeight: "700", color: "#FF6B6B", margin: 0 }}>
              {stats.averageScore}%
            </h3>
          </div>

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "10px" }}>Total Learning Time</p>
            <h3 style={{ fontSize: "28px", fontWeight: "700", color: "#4ECDC4", margin: 0 }}>
              {formatTime(stats.totalTimeSpent)}
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginBottom: "40px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <button
            onClick={handleExportProgress}
            style={{
              backgroundColor: "#667eea",
              color: "white",
              border: "none",
              padding: "12px 25px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            📥 Export Progress
          </button>
          {allProgress.length === 0 && (
            <button
              onClick={handleAddSampleData}
              style={{
                backgroundColor: "#4ECDC4",
                color: "white",
                border: "none",
                padding: "12px 25px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              🧪 Add Sample Data (for testing)
            </button>
          )}
          <button
            onClick={handleClearProgress}
            style={{
              backgroundColor: "#FF6B6B",
              color: "white",
              border: "none",
              padding: "12px 25px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            🗑️ Clear All Progress
          </button>
        </div>

        {/* Progress Table */}
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>📚 Lesson History</h2>
          </div>

          {allProgress.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
              <p style={{ fontSize: "16px" }}>No progress yet. Start learning to see your scores!</p>
              <Link to="/courses" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    backgroundColor: "#667eea",
                    color: "white",
                    border: "none",
                    padding: "10px 25px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginTop: "15px",
                  }}
                >
                  Go to Courses
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #eee" }}>
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", color: "#666" }}>
                      Lesson
                    </th>
                    <th style={{ padding: "15px", textAlign: "center", fontWeight: "600", color: "#666" }}>
                      Course
                    </th>
                    <th style={{ padding: "15px", textAlign: "center", fontWeight: "600", color: "#666" }}>
                      Score
                    </th>
                    <th style={{ padding: "15px", textAlign: "center", fontWeight: "600", color: "#666" }}>
                      Time Spent
                    </th>
                    <th style={{ padding: "15px", textAlign: "center", fontWeight: "600", color: "#666" }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allProgress
                    .slice()
                    .reverse()
                    .map((progress, index) => {
                      const scorePercentage = Math.round(
                        (progress.score / progress.totalQuestions) * 100
                      );
                      const completedDate = new Date(progress.completedAt);
                      const dateStr = completedDate.toLocaleDateString();
                      const timeStr = completedDate.toLocaleTimeString();

                      return (
                        <tr
                          key={index}
                          style={{
                            borderBottom: "1px solid #eee",
                            transition: "background-color 0.2s",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#f8f9fa";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <td style={{ padding: "15px", color: "#333", fontWeight: "500" }}>
                            {progress.lessonTitle}
                          </td>
                          <td style={{ padding: "15px", textAlign: "center", color: "#666" }}>
                            Course {progress.courseId}
                          </td>
                          <td style={{ padding: "15px", textAlign: "center" }}>
                            <span
                              style={{
                                backgroundColor:
                                  scorePercentage >= 80
                                    ? "#d4edda"
                                    : scorePercentage >= 60
                                    ? "#fff3cd"
                                    : "#f8d7da",
                                color:
                                  scorePercentage >= 80
                                    ? "#155724"
                                    : scorePercentage >= 60
                                    ? "#856404"
                                    : "#721c24",
                                padding: "5px 12px",
                                borderRadius: "20px",
                                fontWeight: "600",
                                fontSize: "13px",
                              }}
                            >
                              {progress.score}/{progress.totalQuestions} ({scorePercentage}%)
                            </span>
                          </td>
                          <td style={{ padding: "15px", textAlign: "center", color: "#666" }}>
                            {formatTime(progress.timeSpent)}
                          </td>
                          <td style={{ padding: "15px", textAlign: "center", color: "#999", fontSize: "13px" }}>
                            <div>{dateStr}</div>
                            <div>{timeStr}</div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
