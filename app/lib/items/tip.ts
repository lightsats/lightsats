import { getLanguageCode } from "lib/items/getLanguageCode";
import { Item } from "types/Item";

export const tip: Item[] = [
  {
    category: "tip",
    image: "lightsats.jpg",
    languageCodes: [getLanguageCode("English")],
    platforms: ["web"],
    name: "Lightsats",
    slogan: "Gift Sats without losing them✌🏼",
    link: "/",
    lightsatsRecommended: true,
  },
];
