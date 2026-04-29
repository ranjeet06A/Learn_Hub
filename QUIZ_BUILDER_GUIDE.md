# Quiz Bulk Import System - Documentation

## Overview

The Quiz Bulk Import System allows you to add multiple quiz questions at once by pasting them in a supported format. The system automatically parses your questions and converts them into the proper lesson structure.

## How to Use

### Step 1: Access the Quiz Builder
1. Go to the **Admin Panel** (enter password: `admin123`)
2. Click the **"📝 Bulk Import Quiz"** tab

### Step 2: Prepare Your Questions

You can use any of these three formats:

#### Format 1: JSON (Recommended for programmatic input)
```json
[
  {
    "question": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "answer": "4"
  },
  {
    "question": "What is 5-2?",
    "options": ["1", "2", "3", "4"],
    "answer": "3"
  }
]
```

#### Format 2: Numbered Text (Most Human-Friendly)
```
1. What is 2+2?
a) 3
b) 4
c) 5
d) 6
Answer: b)

2. What is 5-2?
a) 1
b) 2
c) 3
d) 4
Answer: b)
```

#### Format 3: Markdown (Good for documentation)
```markdown
### Question 1: What is 2+2?
- 3
- 4
- 5
- 6
**Answer: 4**

### Question 2: What is 5-2?
- 1
- 2
- 3
- 4
**Answer: 3**
```

### Step 3: Paste and Parse
1. Paste your questions into the textarea
2. Select the format (or leave as "Auto Detect" to auto-detect)
3. Click **"🔍 Parse Questions"**
4. The system will validate your questions and show any errors

### Step 4: Review and Assign
1. View the preview of all parsed questions
2. Select the **Course** from the dropdown
3. Select the **Lesson** within that course
4. Review the questions with the correct answers highlighted
5. Click **"✅ Add Quiz Questions"**

### Step 5: Update Quiz.ts
The system shows you the formatted JSON data that needs to be added to your `src/data/Quiz.ts` file. Copy this code and update your Quiz.ts:

```typescript
export const quizData = {
  1: [
    {
      question: "2 + 2 = ?",
      options: ["3", "4", "5", "6"],
      answer: "4",
    },
    // ... more questions
  ],
};
```

## Supported Question Formats

### Questions
- Any text string
- Can include special characters, numbers, equations
- Example: "What is the chemical formula for water?"

### Options
- Array of 2 or more options
- Each option is a text string
- Options can be:
  - Single letters (a, b, c, d)
  - Full option text
  - Descriptions
  - Code samples

### Answers
- Must exactly match one of the options (case-insensitive for matching)
- Can be:
  - The exact option text
  - A single letter (a, b, c, d)
  - Any unique identifier for the option

## Error Handling

The system validates:
- ✓ All questions have text
- ✓ All questions have 2+ options
- ✓ All questions have an answer
- ✓ All answers match one of the options

If there are errors:
1. A list of issues will be displayed
2. You can go back and fix your input
3. Re-parse and try again

## Utility Files Created

### `quizParser.ts`
Main parsing utility with functions:
- `parseQuizData()` - Auto-detects format and parses
- `parseJsonFormat()` - Parses JSON array format
- `parseTextFormat()` - Parses numbered text format
- `parseMarkdownFormat()` - Parses markdown format
- `validateAnswers()` - Validates answer matches options

### `quizManager.ts`
Quiz data management utilities:
- `addQuestionsToLesson()` - Adds questions to existing lesson quiz
- `replaceQuestionsForLesson()` - Replaces all questions for a lesson
- `getQuizForLesson()` - Retrieves quiz for specific lesson
- `generateQuizCode()` - Generates TypeScript code for Quiz.ts

### `QuizBuilder.tsx`
React component providing the UI for:
- Format selection
- Question input/pasting
- Parsing and validation
- Preview with highlighting
- Course/lesson selection
- Error display

## Example Workflow

### Example 1: Adding Math Quiz Questions

**Input (Numbered Text Format):**
```
1. What is the square root of 16?
a) 2
b) 3
c) 4
d) 5
Answer: c)

2. What is 15 × 3?
a) 35
b) 40
c) 45
d) 50
Answer: c)

3. What is 100 ÷ 4?
a) 20
b) 25
c) 30
d) 35
Answer: b)
```

**Steps:**
1. Go to Bulk Import Quiz tab
2. Leave format as "Auto Detect"
3. Paste the questions
4. Click "Parse Questions"
5. Select Course: "Math"
6. Select Lesson: "Arithmetic"
7. Click "Add Quiz Questions"
8. Copy the generated code to Quiz.ts

### Example 2: Adding Multiple Choice Questions

**Input (JSON Format):**
```json
[
  {
    "question": "Which planet is closest to the Sun?",
    "options": ["Venus", "Mercury", "Earth", "Mars"],
    "answer": "Mercury"
  },
  {
    "question": "What is the largest ocean on Earth?",
    "options": ["Atlantic", "Indian", "Arctic", "Pacific"],
    "answer": "Pacific"
  }
]
```

**Same steps as above** - the system auto-detects JSON format!

## Tips & Best Practices

### ✅ Do:
- Use consistent formatting (all same case for options)
- Make questions clear and unambiguous
- Ensure answers are distinct from options
- Test with a few questions first
- Use quotes in JSON strings properly

### ❌ Don't:
- Mix formats in one paste
- Leave empty options
- Have answers that are too similar to multiple options
- Use special characters in JSON without escaping
- Forget to select a course/lesson before submitting

## Troubleshooting

### "Could not parse quiz data"
- Check your format is correct
- Ensure consistent spacing
- Try a different format
- Look for syntax errors

### "Answer doesn't match any option"
- Make sure the answer text exactly matches an option
- Check for extra spaces or different capitalization
- Try using just the letter (a, b, c, d)

### "No questions parsed"
- Ensure you have questions in the correct format
- Check that all questions have options and answers
- Try pasting just one question to test

## API Reference

### parseQuizData(input: string): ParsedQuizData

Automatically detects format and parses quiz data.

**Returns:**
```typescript
{
  success: boolean;
  questions: QuizQuestion[];
  errors: string[];
}
```

### QuizBuilder Props

```typescript
interface QuizBuilderProps {
  onAddQuiz?: (lessonId: number, questions: QuizQuestion[]) => void;
}
```

## Integration with Existing Code

The Quiz Bulk Import system integrates with your existing:
- `lessonsData` from `src/data/lessons.ts`
- `Quiz.ts` structure
- Admin panel authentication

No changes needed to existing code - just add the new questions to Quiz.ts!

## File Structure

```
src/
├── components/
│   └── QuizBuilder.tsx
├── styles/
│   └── QuizBuilder.css
├── utils/
│   ├── quizParser.ts
│   └── quizManager.ts
└── data/
    └── Quiz.ts (update this file with parsed questions)
```

## Future Enhancements

Possible improvements:
- Direct database integration (auto-save to Quiz.ts)
- CSV import support
- Question images/media support
- Shuffle option support
- Quiz difficulty levels
- Time limits per question
- Question tags/categories

---

**Created:** April 21, 2026
**Version:** 1.0
**Status:** Ready to Use
