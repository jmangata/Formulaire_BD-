#!/usr/bin/env node

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case "ask":
      await require("./commands/ask").run(args.slice(1).join(" "));
      break;

    case "feedback":
      await require("./commands/feedback").run(args.slice(1));
      break;

    case "learn":
      await require("./commands/learn").learn();
      break;

    case "analyze":
      await require("./commands/analyze").run(args[1]);
      break;

    default:
      console.log(`
Usage:
  my-cli ask "question"
  my-cli feedback good|bad "message"
  my-cli learn
  my-cli analyze frontend|backend|docker
      `);
  }
}

main();