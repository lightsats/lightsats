import { getLanguageCode } from "lib/items/getLanguageCode";
import { Item } from "types/Item";

export const donate: Item[] = [
  {
    category: "donate",
    link: "https://tallycoin.app/",
    image: "tallycoin.png",
    languageCodes: [getLanguageCode("English")],
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/ADw+Ra6utFpbYgsOFgDJydD3+P+9vsRUVVsAmpqg3N3j+/v/paesAAEDD52dpNbW3EdIUK78G17JIbcqAAAAAElFTkSuQmCC",
    name: "Tallycoin",
    slogan:
      "Tallycoin is a bitcoin crowdfunding platform where all donations go to a wallet under your control. Zero fees.",
    platforms: ["web"],
  },
];
