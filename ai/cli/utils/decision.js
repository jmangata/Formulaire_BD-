function detectScope(question) {
  const q = question.toLowerCase();

  if (q.includes("angular") || q.includes("form") || q.includes("ui")) {
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

  if (q.includes("refactor")) return "refactor";
  if (q.includes("bug") || q.includes("error")) return "debug";
  if (q.includes("add") || q.includes("create")) return "feature";

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