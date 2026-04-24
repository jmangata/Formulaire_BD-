// ai/cli/commands/task.js
const { read, write } = require("../utils/memory");

const logger = require("../utils/logger");

async function run(args) {
  const action = args[0];
  const tasks = read("tasks.json");
  
 

  if (action === "add") {
    const title = args.slice(1).join(" ");
    if (!title) { logger.error("Titre de tâche requis"); return; }
    tasks.push({ id: Date.now(), title, status: "open" });
    write("tasks.json", tasks);
    logger.success("Task added");
  }

  if (action === "list") {
    tasks.forEach(t => {
      console.log(`[${t.id}] ${t.status.toUpperCase()} - ${t.title}`);
    });
  }

  if (action === "complete") {
    const id = Number(args[1]);
    const task = tasks.find(t => t.id === id);
    if (!task) { logger.error("Tâche non trouvée"); return; }
    task.status = "done";
    write("tasks.json", tasks);
    logger.success("Task completed")
  }
}

module.exports = { run };