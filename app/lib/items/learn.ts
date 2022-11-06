import { getLanguageCode } from "lib/items/getLanguageCode";
import { LearnItem } from "types/LearnItem";

export const learn: LearnItem[] = [
  {
    category: "learn",
    image: "bitcoin.svg",
    languageCodes: [getLanguageCode("English")],
    platforms: ["web"],
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAN0lEQVR4nBXJMRHAIBAAsMwIoxwTAlCCkuqoCGQgAgNfWBMPjZ5UZGKOWG9GIfYXcxTu9nTpzA9c5A04Wb1MyAAAAABJRU5ErkJggg==",
    name: "Bitcoin White Paper",
    slogan: "A Peer-to-Peer Electronic Cash System",
    link: "/bitcoin.pdf",
    difficulty: "hard",
  },
  {
    category: "learn",
    image: "bitcoinrocks.jpg",
    languageCodes: [getLanguageCode("English")],
    platforms: ["web", "mobile"],
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAALklEQVR4nGNgYGBgZICBP4c6/19b/P/Z2lOzchimNeX//vL2/++PVblxcBUgAADVNxG2vqHGpgAAAABJRU5ErkJggg==",
    name: "Bitcoin Rocks",
    slogan:
      "Learn about Bitcoin using our educational articles, videos, and more!",
    link: "https://lgt.st/bitcoinrocks",
    difficulty: "easy",
  },
];
