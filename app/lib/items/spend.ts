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
  {
    category: "spend",
    image: "moon.jpg",
    languageCodes: [getLanguageCode("English")],
    link: "https://lgt.st/moon",
    name: "Moon",
    slogan: "Purchase Moon Visa® Prepaid Cards with crypto. Pay at millions of online merchants with secure virtual cards.",
    platforms: ["web", "mobile"],
  },
  {
    category: "spend",
    image: "bitrefill.png",
    languageCodes: [getLanguageCode("English")],
    link: "https://lgt.st/bitrefill",
    name: "Bitrefill",
    slogan: "Purchase Gift Cards & Mobile Recharges in 170+ countries with BTC.",
    platforms: ["web", "mobile"],
  },
  {
    category: "spend",
    image: "lightningstore.jpeg",
    languageCodes: [getLanguageCode("English")],
    link: "https://lgt.st/lightningstore",
    name: "Lightning Store⚡",
    slogan: "Obscure Bitcoin pop cult/punk mashups 4 sale ⛓⚡️",
    platforms: ["web", "mobile"],
  },
  {
    category: "spend",
    image: "ibexpay.jpeg",
    languageCodes: [getLanguageCode("English")],
    link: "https://lgt.st/ibexpay",
    name: "iBEXPay",
    slogan: "IBEX is a bitcoin infrastructure company specialized in the Lightning Network (LN) enterprise solutions.",
    platforms: ["web", "mobile"],
  },
];
