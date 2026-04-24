const { loadContext } = require("../utils/context");

async function run(scope) {
  const context = loadContext();

  const validScopes = ["frontend", "backend", "docker"];

  if (!validScopes.includes(scope)) {
    console.log("❌ Scope invalide : frontend | backend | docker");
    return;
  }

  const prompt = `
SYSTEM CONTEXT:
${context}

ANALYSIS SCOPE: ${scope}

TASK:
- Analyse uniquement la partie ${scope}
- Identifie :
  - architecture
  - points faibles
  - incohérences
  - améliorations possibles

FORMAT:
- sections claires
- bullet points
- recommandations concrètes
`;

  console.log("\n--- ANALYZE ---\n");
  console.log(prompt);
}

module.exports = { run };