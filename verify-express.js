import fs from "fs";

const path = "./node_modules/express/lib/router/index.js";

if (!fs.existsSync(path)) {
  console.error("Express install is corrupted: router missing");
  process.exit(1);
}

console.log("Express verified OK");