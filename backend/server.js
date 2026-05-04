const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

// ✅ FINAL FIXED CORS (IMPORTANT)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());

// ✅ PREFLIGHT (keep it)
app.options("*", cors());

app.use(express.json());

// ======================
// ENV VARIABLES
// ======================
const PORT = process.env.PORT || 10000;
const SECRET = process.env.JWT_SECRET || "MY_SECRET_KEY";
const MONGO_URI = process.env.MONGO_URI;

// ======================
// SAFETY CHECK
// ======================
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI missing");
  process.exit(1);
}

// ======================
// MONGODB CONNECT
// ======================
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

// ======================
// MODELS
// ======================
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
});

const courseSchema = new mongoose.Schema({
  title: String,
  examId: String,
  lessons: Array,
});

const resultSchema = new mongoose.Schema({
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

const User = mongoose.model("User", userSchema);
const Course = mongoose.model("Course", courseSchema);
const Result = mongoose.model("Result", resultSchema);

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
      message: "Token invalid",
    });
  }
};

// ======================
// ROUTES
// ======================
app.get("/", (req, res) => {
  res.send("🚀 Backend Running Successfully");
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!email || !password) {
      return res.status(400).send("Missing fields");
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).send("User exists");

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed,
      role: email === "admin@admin" ? "admin" : "user",
    });

    await user.save();
    res.send("User created");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();
    password = password?.trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, token, role: user.role });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// RESULTS
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
    res.json(results);
  } catch {
    res.status(500).json({ success: false });
  }
});

// COURSES
app.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch {
    res.status(500).json([]);
  }
});

// ======================
// SERVER START
// ======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});