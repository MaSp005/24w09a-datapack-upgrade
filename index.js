const path = require("path"),
  yauzl = require("yauzl"),
  fs = require("fs"),
  WORKSPACE = path.join(__dirname, "_workspace");

const upgrade = require("./upgrade");

// this is my testing suite now i guess...
const line = `setblock 4 5 6 stone[half=top]`;
console.log("OUTPUT:", upgrade.line(line));

process.exit();

const flags = require('args')
  .option('input', 'Input path of .zip file')
  .option('output', 'Output path of .zip file')
  .parse(process.argv);

console.log("Input file:", flags.i);
console.log("Output file:", flags.o);

// UNZIP
yauzl.open(flags.i, { lazyEntries: true }, (err, zipfile) => {
  if (err) return console.error(err);
  zipfile.readEntry();
  zipfile.on('entry', (entry) => {
    const destDir = path.join(WORKSPACE, path.dirname(entry.fileName));
    // Create directory if needed
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    zipfile.openReadStream(entry, (err, readStream) => {
      if (err) return console.error(err);
      const filePath = path.join(WORKSPACE, entry.fileName);
      readStream.pipe(fs.createWriteStream(filePath));
      readStream.on('end', () => {
        zipfile.readEntry();
      });
    });
  });
  zipfile.on('error', (err) => {
    console.error(err);
    zipfile.close();
  });
});

// REZIP
require("zip-dir")(WORKSPACE, { saveTo: flags.o })