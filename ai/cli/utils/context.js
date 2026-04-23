const fs = require("fs");
const path = require("path");

function loadContext() {
  return fs.readFileSync(
    path.join(__dirname, "../../cli-context.md"),
    "utf-8"
  );
}

module.exports = { loadContext };