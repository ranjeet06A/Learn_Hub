import { useNavigate } from "react-router-dom";

const exams = [
  { id: "upsc", name: "UPSC" },
  { id: "bpsc", name: "BPSC" },
  { id: "ssc", name: "SSC" },
];

export default function SelectExam() {
  const navigate = useNavigate();

  const selectExam = (examId: string) => {
    localStorage.setItem("selected_exam", examId);
    navigate("/courses");
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Select Exam</h2>

      {exams.map((exam) => (
        <button
          key={exam.id}
          onClick={() => selectExam(exam.id)}
          style={{
            display: "block",
            margin: 10,
            padding: 10,
          }}
        >
          {exam.name}
        </button>
      ))}
    </div>
  );
}