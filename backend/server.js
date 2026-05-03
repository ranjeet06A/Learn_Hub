const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// ======================
// ENV VARIABLES
// ======================
const PORT = process.env.PORT || 10000; // ✅ FIXED
const SECRET = process.env.JWT_SECRET || "MY_SECRET_KEY";
const MONGO_URI = process.env.MONGO_URI;

// ======================
// MONGODB CONNECT (FIXED)
// ======================
if (!MONGO_URI) {
  console.log("❌ MONGO_URI is missing in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1); // ✅ important
  });

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
// RESULTS
// ======================
app.post("/results", auth, async (req, res) => {
  try {
    const result = new Result({
      userId: req.user.id,
      ...req.body,
    });

    await result.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get("/results", auth, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user.id });
    res.json(results || []);
  } catch {
    res.status(500).json({ success: false });
  }
});

app.delete("/clear-results", auth, async (req, res) => {
  try {
    await Result.deleteMany({ userId: req.user.id });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// ======================
// COURSES
// ======================
app.get("/courses", auth, async (req, res) => {
  try {
    let courses = await Course.find();

    if (courses.length === 0) {
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
  } catch {
    res.status(500).json([]);
  }
});

app.post("/courses", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false });
  }

  const course = new Course(req.body);
  await course.save();

  res.json({ success: true });
});

// ======================
// ROOT
// ======================
app.get("/", (req, res) => {
  res.send("🚀 Learn Hub Backend Running");
});

// ======================
// SERVER START
// ======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});