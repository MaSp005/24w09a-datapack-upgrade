const changes = require("./changes");

function line(line, guarantees) {
  if (!line.trim()) return "";
  if (line.startsWith("#")) return line;
}

module.exports = {
  function: (file, guarantees) => file.split("\n").map(l => line(l, guarantees)),
  line
}