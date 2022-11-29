import * as fs from "fs";
import { catalog } from "lib/items/catalog";
import { getItemImageLocation } from "lib/utils";
import { getPlaiceholder as generatePlaceholder } from "plaiceholder";

console.log("Generating new placeholders");

(async () => {
  for (const catalogItems of Object.values(catalog)) {
    for (const item of catalogItems) {
      const imageLocation = getItemImageLocation(item);

      const placeholder = await generatePlaceholder(imageLocation);
      // console.log(placeholder.base64);
      const filename = `./lib/items/${item.category}.ts`;
      if (!fs.existsSync(filename)) {
        throw new Error("Categories file does not exist: " + filename);
      }
      const existingPlaceholderUrl = item.placeholderDataUrl;
      if (existingPlaceholderUrl !== placeholder.base64) {
        const lines = fs.readFileSync(filename).toString().split(/\r?\n/);

        if (existingPlaceholderUrl) {
          const linesToReplace = lines
            .map((line, index) => ({ line, index }))
            .filter(
              (lineWithIndex) =>
                lineWithIndex.line.indexOf(existingPlaceholderUrl) > -1
            );
          if (linesToReplace.length > 1) {
            throw new Error(
              "Duplicate placeholder URL: " +
                item.name +
                " " +
                item.category +
                " searched for: " +
                existingPlaceholderUrl
            );
          } else if (linesToReplace.length === 0) {
            throw new Error(
              "Unable to find place to replace old placeholder URL: " +
                item.name +
                " " +
                item.category +
                " searched for: " +
                existingPlaceholderUrl
            );
          }
          if (linesToReplace.length > 0) {
            linesToReplace.forEach((lineWithIndex) => {
              lines.splice(lineWithIndex.index, 1, `"${placeholder.base64}",`);
            });
            console.log(
              "Replaced existing placeholder",
              item.name,
              item.category
            );
          }
        } else {
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
          process.stdout.write(".");
        }

        fs.writeFileSync(filename, lines.join("\n"));
      }
    }
  }
})();
