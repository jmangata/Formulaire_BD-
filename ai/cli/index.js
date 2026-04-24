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

    case "analyse":
      await require("./commands/analyse").run(args[1]);
      break;

    case "task":
      await require("./commands/task").run(args.slice(1));
      break;

    case "doc":
      await require("./commands/doc").run(args.slice(1));
      break;

    default:
      console.log(`
Usage:
  my-cli ask "question"
  my-cli feedback good|bad "message"
  my-cli learn
  my-cli analyse frontend|backend|docker
  my-cli task add "task title"
  my-cli task list
  my-cli task complete <id>
      `);
  }
}

main();