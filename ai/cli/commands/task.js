// ai/cli/commands/task.js
const { read, write } = require("../utils/memory");

async function run(args) {
  const action = args[0];
  const tasks = read("tasks.json");

  if (action === "add") {
    const title = args.slice(1).join(" ");
    tasks.push({ id: Date.now(), title, status: "open" });
    write("tasks.json", tasks);
    console.log("Task added");
  }

  if (action === "list") {
    console.log(tasks);
  }

  if (action === "complete") {
    const id = Number(args[1]);
    const task = tasks.find(t => t.id === id);
    if (task) task.status = "done";
    write("tasks.json", tasks);
    console.log("Task completed");
  }
}

module.exports = { run };