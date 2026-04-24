const { loadContext } = require("../utils/context");
const { buildDecision } = require("../utils/decision");
const { read } = require("../utils/memory");
const logger = require("../utils/logger");

function buildSmartContext(decision) {
  const fileMap = {
    frontend: "formulaire.component.ts, formulaire.component.html, formulaire.schema.ts",
    backend: "index.js, formulaire.service.js, formulaire.repository.js, formulaire.schema.js",
    docker: "docker-compose.yml, Dockerfile"
  };
  const constraintMap = {
    frontend: "ReactiveForms, FormArray, Zod validation frontend",
    backend: "Express 5, Zod validation backend, PostgreSQL transactions",
    docker: "Docker Compose, PostGIS, pm2"
  };
  return `
SMART MODE — ENRICHISSEMENT AUTOMATIQUE:
- Fichiers concernés : ${fileMap[decision.scope] || "projet complet"}
- Contraintes détectées : ${constraintMap[decision.scope] || "aucune"}
- Type de tâche : ${decision.type}
- Priorité : ${decision.priority}
`;
}


async function run(input) {
  const smart = input.includes("--smart");
  const question = input.replace("--smart", "").trim();
 
  const context = loadContext();
  const learnings = read("learnings.md") || "No learnings yet.";
  const decision = buildDecision(question);
  const prompt = `
SYSTEM CONTEXT:
${context}

LEARNED BEHAVIORS:
${learnings}

DECISION ANALYSIS:
- scope: ${decision.scope}
- type: ${decision.type}
- priority: ${decision.priority}
${smart ? buildSmartContext(decision) : ""}
USER QUESTION:
${question}

INSTRUCTIONS:
- Focus on the detected scope: ${decision.scope}
- Adapt response to task type: ${decision.type}
- Provide structured and actionable output
- Avoid past mistakes from learnings
`;

  logger.info(smart ? "AI PROMPT (SMART MODE)" : "AI PROMPT (MODE 2)");
  console.log(prompt);
}

module.exports = { run };