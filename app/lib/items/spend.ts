import { getLanguageCode } from "lib/items/getLanguageCode";
import { Item } from "types/Item";

export const spend: Item[] = [
  {
    category: "spend",
    image: "btcmap.svg",
    languageCodes: [getLanguageCode("English")],
    link: "https://lgt.st/btcmap",
    name: "BTC Map",
    slogan: "Easily find places to spend sats anywhere on the planet.",
    platforms: ["web", "mobile"],
  },
];
