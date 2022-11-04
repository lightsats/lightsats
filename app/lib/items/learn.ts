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
];
