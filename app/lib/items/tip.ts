import { getLanguageCode } from "lib/items/getLanguageCode";
import { Item } from "types/Item";

export const tip: Item[] = [
  {
    category: "tip",
    image: "lightsats.jpg",
    languageCodes: [getLanguageCode("English")],
    platforms: ["web"],
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAALUlEQVR4nGNgYGDg4uISERFhgIADBw58+/YVyvn9+/eJEyegHBEREVZWViALAB/1CxAyCekdAAAAAElFTkSuQmCC",
    name: "Lightsats",
    slogan: "Gift Sats without losing them✌🏼",
    link: "/",
    lightsatsRecommended: true,
  },
];
