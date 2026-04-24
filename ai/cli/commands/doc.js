const { loadContext } = require("../utils/context");
const logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");

async function run() {
  const context = loadContext();

  const prompt = `
SYSTEM CONTEXT:
${context}

TASK:
- Génère une documentation complète du projet

CONTENU:
- architecture globale
- backend (routes, services)
- frontend (components, forms)
- base de données
- flux de données

FORMAT:
- Markdown
- structuré
- prêt à être stocké dans /docs/auto/
`;

  const outputPath = path.join(__dirname, "../../../docs/auto");
  fs.mkdirSync(outputPath, { recursive: true });

  fs.writeFileSync(
    path.join(outputPath, "generated-doc.md"),
    prompt
  );

  logger.success("📄 Documentation générée dans /docs/auto/");
}

module.exports = { run };