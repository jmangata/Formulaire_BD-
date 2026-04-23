const { read, write } = require("../utils/memory");

async function run(args) {
  const type = args[0]; // good | bad
  const message = args.slice(1).join(" ");

  const feedback = read("feedback.json");

  feedback.push({
    id: Date.now(),
    type,
    message,
    timestamp: new Date().toISOString()
  });

  write("feedback.json", feedback);

  console.log("📌 Feedback saved");
}

module.exports = { run };