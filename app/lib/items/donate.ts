import { getLanguageCode } from "lib/items/getLanguageCode";
import { Item } from "types/Item";

export const donate: Item[] = [
  {
    category: "donate",
    link: "https://tallycoin.app/",
    image: "tallycoin.png",
    languageCodes: [getLanguageCode("English")],
    name: "Tallycoin",
    slogan:
      "Tallycoin is a bitcoin crowdfunding platform where all donations go to a wallet under your control. Zero fees.",
    platforms: ["web"],
  },
];
