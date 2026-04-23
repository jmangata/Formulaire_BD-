// ai/cli/cli.js
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case "ask":
      await require("./commands/ask").run(args.slice(1).join(" "));
      break;

    case "task":
      await require("./commands/task").run(args.slice(1));
      break;

    case "analyze":
      await require("./commands/analyze").run(args[1]);
      break;

    case "doc":
      await require("./commands/doc").run();
      break;

    case "feedback":
      await require("./commands/feedback").run(args.slice(1));
      break;

    case "learn":
      await require("./commands/feedback").learn();
      break;

    default:
      console.log(`
Commands:
  ask "question"
  task add/list/complete
  analyze backend|frontend|docker
  doc
  feedback good|bad "message"
  learn
      `);
  }
}

main();