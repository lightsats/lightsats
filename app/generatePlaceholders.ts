import * as fs from "fs";
import { catalog } from "lib/items/catalog";
import { getItemImageLocation } from "lib/utils";
import { getPlaiceholder } from "plaiceholder";

(async () => {
  for (const entry of Object.values(catalog)) {
    for (const item of entry) {
      if (!item.placeholderDataUrl && item.image) {
        const imageLocation = getItemImageLocation(item);
        console.log("add placeholder: " + imageLocation);
        const placeholder = await getPlaiceholder(imageLocation);
        console.log(placeholder.base64);
        const filename = `./lib/items/${item.category}.ts`;
        if (!fs.existsSync(filename)) {
          throw new Error("Categories file does not exist: " + filename);
        }
        const lines = fs.readFileSync(filename).toString().split(/\r?\n/);
        const insertIndex = lines.findIndex(
          (line) => line.trim() === `name: "${item.name}",`
        );
        if (insertIndex < 0) {
          throw new Error(
            "Could not find place to insert placeholder for item: " +
              item +
              " in file " +
              filename
          );
        }
        lines.splice(
          insertIndex,
          0,
          `  placeholderDataUrl: "${placeholder.base64}",`
        );
        fs.writeFileSync(filename, lines.join("\n"));
      }
    }
  }
})();
/*try {
  getPlaiceholder("/path-to-your-image.jpg").then(({ base64 }) =>
    console.log(base64)
  );
} catch (err) {
  err;
}*/
