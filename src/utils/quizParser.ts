export function parseQuiz(text: string) {
  const questions = text.split(/Q\d+\./).filter(Boolean);

  return questions.map((block) => {
    const lines = block.trim().split("\n").map(l => l.trim());

    let questionText = "";
    let options: string[] = [];
    let correctIndex = 0;

    let optionMap: any = {
      "(I)": 0,
      "(II)": 1,
      "(III)": 2,
      "(IV)": 3
    };

    lines.forEach((line) => {

      // 🟢 QUESTION + STATEMENTS
      if (
        line.startsWith("With") ||
        line.startsWith("In") ||
        line.startsWith("Which")
      ) {
        questionText += line + " ";
      }

      // 🟢 A B C D statements
      else if (/^[A-D]\./.test(line)) {
        questionText += line + " ";
      }

      // 🟢 OPTIONS (I)(II)(III)(IV)
      else if (/^\(I\)|^\(II\)|^\(III\)|^\(IV\)/.test(line)) {
        const clean = line.replace(/^\(\w+\)\s*/, "");
        options.push(clean);
      }

      // 🟢 CORRECT ANSWER
      else if (line.includes("Correct Answer")) {
        const match = line.match(/\(\w+\)/);
        if (match) {
          correctIndex = optionMap[match[0]];
        }
      }
    });

    return {
      question: questionText.trim(),
      options,
      correctIndex
    };
  });
}