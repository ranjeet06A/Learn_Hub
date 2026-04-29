const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "MY_SECRET_KEY";

// ======================
// MONGODB CONNECT
// ======================
mongoose
  .connect("mongodb://127.0.0.1:27017/learnhub")
  .then(() => console.log("✅ MongoDB Connected to learnhub"))
  .catch((err) => console.log("❌ Mongo Error:", err));

mongoose.connection.once("open", () => {
  console.log("🔥 DB NAME:", mongoose.connection.name);
});

// ======================
// MODELS
// ======================
const User = mongoose.model("User", {
  email: String,
  password: String,
  role: String,
});

const Course = mongoose.model("Course", {
  title: String,
  examId: String,
  lessons: Array,
});

const Result = mongoose.model("Result", {
  userId: String,
  courseId: String,
  lessonId: String,
  quizIndex: Number,
  correct: Number,
  wrong: Number,
  attempted: Number,
  score: Number,
  total: Number,
  attemptDate: String,
  attemptTime: String,
  timeSpent: Number,
});

// ======================
// AUTH MIDDLEWARE
// ======================
const auth = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  try {
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token expired or invalid",
    });
  }
};

// ======================
// REGISTER
// ======================
app.post("/register", async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!email || !password) {
      return res.status(400).send("Missing fields");
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).send("User already exists");
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed,
      role: email === "admin@admin" ? "admin" : "user",
    });

    await user.save();

    res.send("User created");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// ======================
// LOGIN
// ======================
app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();
    password = password?.trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Wrong password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// ======================
// SAVE RESULT
// ======================
app.post("/results", auth, async (req, res) => {
  try {
    const result = new Result({
      userId: req.user.id,
      courseId: req.body.courseId,
      lessonId: req.body.lessonId,
      quizIndex: req.body.quizIndex,
      correct: req.body.correct,
      wrong: req.body.wrong,
      attempted: req.body.attempted,
      score: req.body.score,
      total: req.body.total,
      attemptDate: req.body.attemptDate,
      attemptTime: req.body.attemptTime,
      timeSpent: req.body.timeSpent,
    });

    await result.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ======================
// GET RESULTS
// ======================
app.get("/results", auth, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user.id });
    return res.json(results || []);
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

// ======================
// CLEAR RESULTS
// ======================
app.delete("/clear-results", auth, async (req, res) => {
  try {
    await Result.deleteMany({ userId: req.user.id });
    res.json({ success: true, message: "Your results cleared" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ======================
// COURSES (FIXED HERE)
// ======================
app.get("/courses", auth, async (req, res) => {
  try {
    let courses = await Course.find();

    // 🔥 AUTO CREATE DEFAULT COURSE IF EMPTY
    if (courses.length === 0) {
      console.log("⚠ No courses found. Creating default course...");

      const defaultCourse = new Course({
        title: "INCOME TAX",
        examId: "RAE",
        lessons: [
          {
            id: "lesson1",
            title: "Chapter 1",
            content: "Introduction to Income Tax",
          },
        ],
      });

      await defaultCourse.save();

      courses = await Course.find();
    }

    res.json(courses);
  } catch (err) {
    console.log("COURSES ERROR:", err);
    res.status(500).json([]);
  }
});

// ======================
// ADD COURSE (ADMIN)
// ======================
app.post("/courses", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not allowed",
    });
  }

  const course = new Course(req.body);
  await course.save();

  res.json({ success: true, message: "Course added" });
});

// ======================
app.listen(5000, () =>
  console.log("🚀 Server running on port 5000")
);