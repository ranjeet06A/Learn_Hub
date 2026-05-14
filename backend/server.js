const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const compression = require("compression");

require("dotenv").config();

const app = express();

// ======================
// CORS
// ======================
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        origin.includes("vercel.app") ||
        origin.includes("localhost")
      ) {
        callback(null, true);
      } else {
        callback(
          new Error(
            "Not allowed by CORS"
          )
        );
      }
    },
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.json());

// ✅ PERFORMANCE
app.use(compression());

// ======================
// ENV
// ======================
const PORT =
  process.env.PORT ||
  10000;

const SECRET =
  process.env.JWT_SECRET ||
  "MY_SECRET_KEY";

const MONGO_URI =
  process.env.MONGO_URI;

// ======================
// SAFETY
// ======================
if (!MONGO_URI) {
  console.error(
    "❌ MONGO_URI missing"
  );

  process.exit(1);
}

// ======================
// MONGODB
// ======================
mongoose
  .connect(MONGO_URI, {
    maxPoolSize: 10,
  })
  .then(() => {
    console.log(
      "✅ MongoDB Connected"
    );
  })
  .catch((err) => {
    console.log(
      "❌ Mongo Error:",
      err.message
    );

    process.exit(1);
  });

// ======================
// SCHEMAS
// ======================

const quizSchema =
  new mongoose.Schema({
    questionTitle: String,
    statements: [String],
    options: [String],
    correctIndex: Number,
  });

const lessonSchema =
  new mongoose.Schema({
    title: String,
    content: String,
    quizzes: [quizSchema],
  });

const courseSchema =
  new mongoose.Schema({
    title: String,
    examId: String,
    lessons: [lessonSchema],
  });

const userSchema =
  new mongoose.Schema({
    email: String,
    password: String,
    role: String,
  });

const resultSchema =
  new mongoose.Schema({
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
    createdAt: String,
  });

// ======================
// MODELS
// ======================
const Course =
  mongoose.model(
    "Course",
    courseSchema
  );

const User =
  mongoose.model(
    "User",
    userSchema
  );

const Result =
  mongoose.model(
    "Result",
    resultSchema
  );

// ======================
// AUTH
// ======================
const auth = (
  req,
  res,
  next
) => {
  let token =
    req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        message: "No token",
      });
  }

  try {
    if (
      token.startsWith(
        "Bearer "
      )
    ) {
      token =
        token.split(
          " "
        )[1];
    }

    const decoded =
      jwt.verify(
        token,
        SECRET
      );

    req.user =
      decoded;

    next();
  } catch (err) {
    return res
      .status(401)
      .json({
        success: false,
        message:
          "Invalid token",
      });
  }
};

// ======================
// ROOT
// ======================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Backend running",
  });
});

// ======================
// HEALTH CHECK
// ======================
app.get(
  "/health",
  (req, res) => {
    res
      .status(200)
      .send("OK");
  }
);

// ======================
// REGISTER
// ======================
app.post(
  "/register",
  async (req, res) => {
    try {
      let {
        email,
        password,
      } = req.body;

      email =
        email
          ?.trim()
          .toLowerCase();

      password =
        password?.trim();

      if (
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Missing fields",
          });
      }

      const existing =
        await User.findOne(
          { email }
        );

      if (existing) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "User already exists",
          });
      }

      const hashed =
        await bcrypt.hash(
          password,
          10
        );

      const user =
        new User({
          email,
          password:
            hashed,
          role:
            email ===
            "admin@admin"
              ? "admin"
              : "user",
        });

      await user.save();

      res.json({
        success: true,
        message:
          "User created",
      });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          message:
            "Server error",
        });
    }
  }
);

// ======================
// LOGIN
// ======================
app.post(
  "/login",
  async (req, res) => {
    try {
      let {
        email,
        password,
      } = req.body;

      email =
        email
          ?.trim()
          .toLowerCase();

      password =
        password?.trim();

      const user =
        await User.findOne(
          { email }
        );

      if (!user) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "User not found",
          });
      }

      const match =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!match) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid password",
          });
      }

      const token =
        jwt.sign(
          {
            id: user._id,
            role:
              user.role,
          },
          SECRET,
          {
            expiresIn:
              "1h",
          }
        );

      res.json({
        success: true,
        token,
        role: user.role,
      });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          message:
            "Server error",
        });
    }
  }
);

// ======================
// GET ALL COURSES
// ======================
app.get(
  "/courses",
  async (req, res) => {
    try {
      const courses =
        await Course.find().lean();

      res.json(
        courses
      );
    } catch (err) {
      res
        .status(500)
        .json([]);
    }
  }
);

// ======================
// GET SINGLE COURSE
// ======================
app.get(
  "/courses/:id",
  async (req, res) => {
    try {
      const course =
        await Course.findById(
          req.params.id
        ).lean();

      if (!course) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Course not found",
          });
      }

      res.json(
        course
      );
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
        });
    }
  }
);

// ======================
// ADD COURSE
// ======================
app.post(
  "/courses",
  async (req, res) => {
    try {
      const {
        title,
        examId,
      } = req.body;

      if (
        !title ||
        !examId
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Title and examId required",
          });
      }

      const course =
        new Course({
          title,
          examId,
          lessons: [],
        });

      await course.save();

      res.json({
        success: true,
        course,
      });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          error:
            err.message,
        });
    }
  }
);

// ======================
// UPDATE COURSE
// ======================
app.put(
  "/courses/:id",
  async (req, res) => {
    try {
      const updatedCourse =
        await Course.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
          }
        );

      if (
        !updatedCourse
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Course not found",
          });
      }

      res.json({
        success: true,
        message:
          "Course updated successfully",
        course:
          updatedCourse,
      });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          message:
            "Update failed",
        });
    }
  }
);

// ======================
// DELETE COURSE
// ======================
app.delete(
  "/courses/:id",
  async (req, res) => {
    try {
      const deletedCourse =
        await Course.findByIdAndDelete(
          req.params.id
        );

      if (
        !deletedCourse
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Course not found",
          });
      }

      res.json({
        success: true,
        message:
          "Course deleted successfully",
      });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          message:
            "Delete failed",
        });
    }
  }
);

// ======================
// ADD LESSON
// ======================
app.post(
  "/courses/:courseId/lessons",
  async (req, res) => {
    try {
      const {
        courseId,
      } = req.params;

      const {
        title,
        content,
      } = req.body;

      const course =
        await Course.findById(
          courseId
        );

      if (!course) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Course not found",
          });
      }

      course.lessons.push(
        {
          title,
          content,
          quizzes: [],
        }
      );

      await course.save();

      res.json({
        success: true,
        lessons:
          course.lessons,
      });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to add lesson",
        });
    }
  }
);

// ======================
// GET QUIZZES
// ======================
app.get(
  "/quizzes/:lessonId",
  async (req, res) => {
    try {
      const { lessonId } =
        req.params;

      const courses =
        await Course.find();

      for (const course of courses) {
        const lesson =
          course.lessons.find(
            (l) =>
              String(l._id) ===
              String(lessonId)
          );

        if (lesson) {
          let quizzes =
            lesson.quizzes || [];

          // ✅ SUPPORT OLD + NEW FORMAT
          quizzes =
            quizzes.map(
              (
                quiz,
                index
              ) => {
                // OLD ARRAY FORMAT
                if (
                  Array.isArray(
                    quiz
                  )
                ) {
                  return {
                    title: `Quiz ${
                      index + 1
                    }`,
                    questions:
                      quiz,
                  };
                }

                // NEW FORMAT
                if (
                  quiz.questions
                ) {
                  return quiz;
                }

                // SINGLE QUESTION FORMAT
                return {
                  title: `Quiz ${
                    index + 1
                  }`,
                  questions:
                    [quiz],
                };
              }
            );

          return res.json(
            quizzes
          );
        }
      }

      res.json([]);
    } catch (err) {
      console.log(err);

      res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to load quizzes",
        });
    }
  }
);

// ======================
// DELETE QUIZ
// ======================
app.delete(
  "/courses/:courseId/lessons/:lessonId/quizzes/:quizIndex",
  async (req, res) => {
    try {
      const {
        courseId,
        lessonId,
        quizIndex,
      } = req.params;

      const course =
        await Course.findById(
          courseId
        );

      if (!course) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Course not found",
          });
      }

      const lesson =
        course.lessons.id(
          lessonId
        );

      if (!lesson) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Lesson not found",
          });
      }

      lesson.quizzes.splice(
        Number(
          quizIndex
        ),
        1
      );

      await course.save();

      res.json({
        success: true,
        message:
          "Quiz deleted successfully",
      });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
        });
    }
  }
);

// ======================
// UPDATE QUIZ
// ======================
app.put(
  "/courses/:courseId/lessons/:lessonId/quizzes/:quizIndex",
  async (req, res) => {
    try {
      const {
        courseId,
        lessonId,
        quizIndex,
      } = req.params;

      const course =
        await Course.findById(
          courseId
        );

      if (!course) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Course not found",
          });
      }

      const lesson =
        course.lessons.id(
          lessonId
        );

      if (!lesson) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Lesson not found",
          });
      }

      lesson.quizzes[
        Number(
          quizIndex
        )
      ] = req.body;

      await course.save();

      res.json({
        success: true,
        message:
          "Quiz updated successfully",
      });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
        });
    }
  }
);

// ======================
// SAVE RESULT
// ======================
app.post(
  "/results",
  auth,
  async (req, res) => {
    try {
      const result =
        new Result({
          userId:
            req.user.id,
          ...req.body,
        });

      await result.save();

      res.json({
        success: true,
      });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
        });
    }
  }
);

// ======================
// GET RESULTS
// ======================
app.get(
  "/results",
  auth,
  async (req, res) => {
    try {
      const results =
        await Result.find(
          {
            userId:
              req.user.id,
          }
        ).lean();

      res.json(
        results
      );
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
        });
    }
  }
);

// ======================
// DELETE RESULTS
// ======================
app.delete(
  "/results",
  async (req, res) => {
    try {
      await Result.deleteMany(
        {}
      );

      res.json({
        success: true,
        message:
          "All results deleted",
      });
    } catch (err) {
      res
        .status(500)
        .json({
          error:
            err.message,
        });
    }
  }
);

// ======================
// SEED
// ======================
app.get(
  "/seed",
  async (req, res) => {
    try {
      await Course.deleteMany();

      await Course.create(
        [
          {
            title:
              "Physics Basics",

            examId:
              "NEET",

            lessons: [
              {
                title:
                  "Motion",

                content:
                  "Introduction to motion",

                quizzes:
                  [],
              },
              {
                title:
                  "Force",

                content:
                  "Introduction to force",

                quizzes:
                  [],
              },
            ],
          },
        ]
      );

      res.json({
        success: true,
        message:
          "Courses added",
      });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          error:
            err.message,
        });
    }
  }
);

// ======================
// START
// ======================
app.listen(
  PORT,
  () => {
    console.log(
      `🚀 Server running on port ${PORT}`
    );
  }
);