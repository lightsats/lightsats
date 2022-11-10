import * as fs from "fs";
import { catalog } from "lib/items/catalog";

(async () => {
  for (const entry of Object.values(catalog)) {
    for (const item of entry) {
      const filename = `./public/items/${item.category}/${item.image}`;
      const filesize = (await fs.statSync(filename).size) / 1024;
      if (filesize > 200) {
        console.warn("large file: " + filename + " [" + filesize + "kb]");
      }
    }
  }
})();
