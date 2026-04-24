function detectScope(question) {
  const q = question.toLowerCase();

  if (q.includes("angular") || q.includes("form") || q.includes("ui") ||
      q.includes("ux") || q.includes("interface") || q.includes("composant") ||
      q.includes("design") || q.includes("style") || q.includes("css") ||
      q.includes("html") || q.includes("formulaire")) {
    return "frontend";
  }

  if (q.includes("api") || q.includes("express") || q.includes("db")) {
    return "backend";
  }

  if (q.includes("docker") || q.includes("compose")) {
    return "docker";
  }

  return "general";
}

function detectType(question) {
  const q = question.toLowerCase();

  if (q.includes("refactor") || q.includes("refonte") || q.includes("moderne") || q.includes("redesign") || q.includes("charte") ||
      q.includes("ux") || q.includes("am\u00e9lioration") || q.includes("amelioration") || q.includes("integration")) return "refactor";
  if (q.includes("bug") || q.includes("error") || q.includes("erreur") || q.includes("corrige") || q.includes("fix")) return "debug";
  if (q.includes("add") || q.includes("create") || q.includes("ajoute") || q.includes("crée") || q.includes("nouvelle")) return "feature";
  if (q.includes("doc") || q.includes("document") || q.includes("explique") || q.includes("comment")) return "doc";

  return "general";
}

function buildDecision(question) {
  const scope = detectScope(question);
  const type = detectType(question);

  return {
    scope,
    type,
    priority: type === "refactor" ? "high" : "normal"
  };
}

module.exports = { buildDecision };