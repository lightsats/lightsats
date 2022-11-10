import { Item } from "types/Item";
import { getLanguageCode } from "lib/items/getLanguageCode";

export const save: Item[] = [
      {
        category: "save",
        image: "trezor.jpeg",
        languageCodes: [getLanguageCode("English")],
        platforms: ["web"],
        name: "Trezor",
        slogan: "SeedSigner: Air-gapped DIY Bitcoin Signing Device",
        link: "https://lgt.st/trezor",
      },
      {
        category: "save",
        image: "coldcard.jpeg",
        languageCodes: [getLanguageCode("English")],
        platforms: ["web"],
        name: "COLDCARD",
        slogan: "SCOLDCARD Is The Most Trusted and Secure Bitcoin Signing Device (aka. Bitcoin Hardware Wallet)	",
        link: "https://lgt.st/coldcard",
      },
      {
        category: "save",
        image: "ledger.jpeg",
        languageCodes: [getLanguageCode("English")],
        platforms: ["web"],
        name: "Ledger",
        slogan: "SCOLDCARD Is The Most Trusted and Secure Bitcoin Signing Device (aka. Bitcoin Hardware Wallet)	",
        link: "https://lgt.st/ledger",
      },
      {
        category: "save",
        image: "seedsigner.jpeg",
        languageCodes: [getLanguageCode("English")],
        platforms: ["web"],
        name: "SeedSigner",
        slogan: "SeedSigner: Air-gapped DIY Bitcoin Signing Device",
        link: "https://lgt.st/seedsigner",
      },
      {
        category: "save",
        image: "foundation.jpeg",
        languageCodes: [getLanguageCode("English")],
        platforms: ["web"],
        name: "Foundation",
        slogan: "Reclaim your sovereignty with the new standard for Bitcoin self custody. Introducing Passport hardware wallet and Envoy mobile app.",
        link: "https://lgt.st/foundation",
      },
      {
        category: "save",
        image: "bitbox.jpeg",
        languageCodes: [getLanguageCode("English")],
        platforms: ["web"],
        name: "BitBox",
        slogan: "Swiss-made hardware and software for easy Bitcoin and cryptocurrency storage.",
        link: "https://lgt.st/foundation",
      },
];
