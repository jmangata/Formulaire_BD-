const { loadContext } = require("../utils/context");
const { buildDecision } = require("../utils/decision");
const { read } = require("../utils/memory");
const { detectProjectStructure, buildSmartWindsurfPrompt, buildStandardPrompt } = require("../utils/windsurf");
const logger = require("../utils/logger");

async function run(input) {
  const windsurf = input.includes("--windsurf") || input.includes("--cascade");
  const smart = input.includes("--smart");
  const question = input.replace(/--(windsurf|cascade|smart)/g, "").trim();

  if (!question) {
    logger.error("❌ Aucune question fournie. Exemple: npx my-cli ask \"ajoute la validation\"");
    return;
  }

  const context = loadContext();
  const learnings = read("learnings.md") || "No learnings yet.";
  const decision = buildDecision(question);
  const projectStructure = detectProjectStructure();

  let prompt;

  if (windsurf || smart) {
    // Mode optimisé avec connaissance du projet
    prompt = buildSmartWindsurfPrompt(decision, question, projectStructure);
  } else {
    // Mode standard basique
    prompt = buildStandardPrompt(decision, question);
  }

  // Titre selon le mode
  const modeLabel = windsurf ? "🌊 WINDSURF PROMPT" : smart ? "🧠 SMART PROMPT" : "AI PROMPT";
  logger.info(`${modeLabel} (prêt pour Cascade)`);
  
  // Affichage stylisé
  console.log("\n" + "═".repeat(70));
  console.log(prompt);
  console.log("═".repeat(70) + "\n");

  // Copie dans le presse-papier
  try {
    const { execSync } = require("child_process");
    const escaped = prompt.replace(/"/g, '\\"').replace(/\n/g, "\\n");
    execSync(`powershell -Command "Set-Clipboard -Value \\"${escaped}\\""`, { stdio: "ignore" });
    logger.info("✅ Prompt copié dans le presse-papier !");
  } catch (e) {}
}

module.exports = { run };