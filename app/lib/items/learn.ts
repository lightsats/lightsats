import { getLanguageCode } from "lib/items/getLanguageCode";
import { LearnItem } from "types/LearnItem";

export const learn: LearnItem[] = [
  {
    category: "learn",
    image: "bitcoin.svg",
    languageCodes: [getLanguageCode("English")],
    platforms: ["web"],
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
    name: "Bitcoin Rocks",
    slogan: "Learn about Bitcoin using our educational articles, videos, and more!",
    link: "https://lgt.st/bitcoinrocks",
    difficulty: "easy",
  },
  {
    category: "learn",
    image: "sayloracademy.png",
    languageCodes: [getLanguageCode("English")],
    platforms: ["web", "mobile"],
    name: "Saylor Academy",
    slogan: "Bitcoin is increasingly being adopted as pristine collateral, a longer-term store of value, and unstoppable money",
    link: "https://lgt.st/sayloracademy",
    difficulty: "hard",
  },
];
