import * as fs from "fs";
import { catalog } from "lib/items/catalog";

(async () => {
  for (const key in catalog) {
    const filename = `./lib/items/${key}.ts`;
    console.log("Removing placeholders: " + filename);
    if (!fs.existsSync(filename)) {
      throw new Error("Categories file does not exist: " + filename);
    }
    const lines = fs.readFileSync(filename).toString().split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].indexOf("placeholderDataUrl:") > -1) {
        lines.splice(i, 2);
        process.stdout.write(".");
      }
    }

    fs.writeFileSync(filename, lines.join("\n"));
  }
})();
