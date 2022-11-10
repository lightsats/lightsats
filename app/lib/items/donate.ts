import { getLanguageCode } from "lib/items/getLanguageCode";
import { Item } from "types/Item";

export const donate: Item[] = [
  {
    category: "donate",
    link: "https://lgt.st/tallycoin",
    image: "tallycoin.png",
    languageCodes: [getLanguageCode("English")],
    name: "Tallycoin",
    slogan:
      "Tallycoin is a bitcoin crowdfunding platform where all donations go to a wallet under your control. Zero fees.",
    platforms: ["web"],
  },
  {
    category: "donate",
    link: "https://lgt.st/geyserfund",
    image: "geyserfund.jpeg",
    languageCodes: [getLanguageCode("English")],
    name: "Geyser Fund",
    slogan:
      "Geyser is a bitcoin crowdfunding platform that enables campaign creators to launch their projects with rewards and engage their communities with posts and content.	",
    platforms: ["web"],
  },
  {
    category: "donate",
    link: "https://lgt.st/opensats",
    image: "opensats.png",
    languageCodes: [getLanguageCode("English")],
    name: "Open Sats",
    slogan:
      "Open source dev funding powered by sats - 100% pass through with no management fees - 501(c)(3) approved - bitcoin for a better world! ",
    platforms: ["web"],
  },
  {
    category: "donate",
    link: "https://lgt.st/machankura",
    image: "machankura.jpeg",
    languageCodes: [getLanguageCode("English")],
    name: "Machankura",
    slogan:
      "Use Bitcoin on any mobile phone! Machankura turns your phone into a lightning wallet allowing you to send and receive bitcoin with just your mobile number.",
    platforms: ["web"],
  },
  {
    category: "donate",
    link: "https://lgt.st/bitcoinekasi",
    image: "bitcoinekasi.jpeg",
    languageCodes: [getLanguageCode("English")],
    name: "Bitcoin Ekasi",
    slogan:
      "Bitcoin Ekasi (Mossel Bay, South Africa) is inspired by Bitcoin Beach (El Zonte, El Salvador) Bitcoin Ekasi is an extension of The Surfer Kids Non-Profit.",
    platforms: ["web"],
  },
];
