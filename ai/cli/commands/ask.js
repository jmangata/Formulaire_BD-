const { loadContext } = require("../utils/context");
const fs = require("fs");
const path = require("path");

function loadLearnings() {
  return fs.readFileSync(
    path.join(__dirname, "../../memory/learnings.md"),
    "utf-8"
  );
}

async function run(question) {
  const context = loadContext();
  const learnings = loadLearnings();

  const prompt = `
SYSTEM CONTEXT:
${context}

LEARNED BEHAVIORS:
${learnings}

USER QUESTION:
${question}

INSTRUCTIONS:
- Use learned behaviors to improve response quality
- Avoid repeating past mistakes
- Be precise and structured when required
`;

  console.log("\n--- AI PROMPT ---\n");
  console.log(prompt);
}

module.exports = { run };