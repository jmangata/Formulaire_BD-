const fs = require("fs");
const path = require("path");

const base = path.join(__dirname, "../../memory");

function read(file) {
  const filePath = path.join(base, file);

  if (!fs.existsSync(filePath)) {
    if (file.endsWith(".json")) return [];
    return "";
  }

  const content = fs.readFileSync(filePath, "utf-8");

  return file.endsWith(".json") ? JSON.parse(content) : content;
}

function write(file, data) {
  const filePath = path.join(base, file);

  fs.writeFileSync(
    filePath,
    file.endsWith(".json")
      ? JSON.stringify(data, null, 2)
      : data
  );
}

module.exports = { read, write };