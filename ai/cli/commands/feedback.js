const { read, write } = require("../utils/memory");
const logger = require("../utils/logger");

async function run(args) {
  const type = args[0];
  const message = args.slice(1).join(" ");

  if (!["good", "bad"].includes(type)) {
    logger.error('Type invalide. Utilise "good" ou "bad"');
    return;
  }

  if (!message) {
    logger.error("Message de feedback requis");
    return;
  }

  const feedback = read("feedback.json");

  feedback.push({
    id: Date.now(),
    type,
    message,
    timestamp: new Date().toISOString()
  });

  write("feedback.json", feedback);

  logger.success("Feedback saved");
}

module.exports = { run };