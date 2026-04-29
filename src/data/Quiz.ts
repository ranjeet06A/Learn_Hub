// ✅ SAFE PARSE FUNCTION
const safeParse = (data: string | null) => {
  try {
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("❌ JSON Parse Error:", e);
    return {};
  }
};

// ✅ GET QUIZ DATA (FINAL FIX)
export const getQuizData = () => {
  const stored = localStorage.getItem("quizData");

  if (!stored) {
    console.warn("⚠️ No quizData found in localStorage");
    return {}; // ❌ NO DEFAULT OVERRIDE
  }

  const parsed = safeParse(stored);

  console.log("📦 Loaded quizData:", parsed);

  return parsed;
};