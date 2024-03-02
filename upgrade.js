const changes = require("./changes");

function line(line) {
  if (!line.trim()) return "";
  if (line.startsWith("#")) return line;
}

module.exports = {
  function: file => file.split("\n").map(l => line(l, guarantees)),
  line
}