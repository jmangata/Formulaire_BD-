const { loadContext } = require("../utils/context");

async function run() {
  console.log(loadContext());
}

module.exports = { run };