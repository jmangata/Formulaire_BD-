const { read, write } = require("../utils/memory");
const fs = require("fs");
const path = require("path");

function detectPatterns(feedback) {
  const patterns = [];

  // 1. erreurs fréquentes
  const badFeedback = feedback.filter(f => f.type === "bad");

  if (badFeedback.length >= 3) {
    patterns.push(
      "User often marks responses as incorrect → improve precision and avoid assumptions."
    );
  }

  // 2. détection de répétition de mots
  const keywords = {};

  feedback.forEach(f => {
    const words = f.message
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ");

    words.forEach(w => {
      if (w.length > 4) {
        keywords[w] = (keywords[w] || 0) + 1;
      }
    });
  });

  const frequent = Object.entries(keywords)
    .filter(([_, count]) => count >= 3)
    .map(([word]) => word);

  if (frequent.length > 0) {
    patterns.push(
      `User frequently interacts with: ${frequent.join(", ")}`
    );
  }

  return patterns;
}

async function learn() {
  const feedback = read("feedback.json");
  const tasks = read("tasks.json");

  const patterns = detectPatterns(feedback);

  const insights = [];

  if (patterns.length > 0) {
    insights.push(...patterns);
  }

  if (tasks.length > 5) {
    insights.push(
      "User manages many tasks → prefer structured, concise responses."
    );
  }

  if (insights.length === 0) {
    insights.push("No significant patterns detected yet.");
  }

  const output = `
# 🧠 AI LEARNINGS

${insights.map(i => `- ${i}`).join("\n")}
`;

  fs.writeFileSync(
    path.join(__dirname, "../../memory/learnings.md"),
    output
  );

  console.log("🧠 Learning system updated");
}

module.exports = { learn };