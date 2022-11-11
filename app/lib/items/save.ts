import { Item } from "types/Item";
import { getLanguageCode } from "lib/items/getLanguageCode";

export const save: Item[] = [
  {
    category: "save",
    image: "trezor.jpeg",
    languageCodes: [getLanguageCode("English")],
    platforms: ["web"],
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAKklEQVR4nB3JsQ0AIBDDQLfZwYtQsj4zUTzkKksG2AWQ5FYS1FPqn6teDX4wDl+IxOk6AAAAAElFTkSuQmCC",
    name: "Trezor",
    slogan: "SeedSigner: Air-gapped DIY Bitcoin Signing Device",
    link: "https://lgt.st/trezor",
  },
  {
    category: "save",
    image: "coldcard.jpeg",
    languageCodes: [getLanguageCode("English")],
    platforms: ["web"],
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/AP/09PHZ2f/09P/09ACRVlk+AAB2NDl9P0EAm2NkRAAAOwAAgEBEAP/09Pvo6Pvm5v/09PgpHPwvH3F5AAAAAElFTkSuQmCC",
    name: "COLDCARD",
    slogan:
      "SCOLDCARD Is The Most Trusted and Secure Bitcoin Signing Device (aka. Bitcoin Hardware Wallet)	",
    link: "https://lgt.st/coldcard",
  },
  {
    category: "save",
    image: "ledger.jpeg",
    languageCodes: [getLanguageCode("English")],
    platforms: ["web"],
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAOElEQVR4nAXBoREAMAgDQGaIqENE5A6BYT5WYFc0rv8GICIkvfeM5O52d2aau9/dzFSVAZBEEsAHWt4NPCHj1HgAAAAASUVORK5CYII=",
    name: "Ledger",
    slogan:
      "SCOLDCARD Is The Most Trusted and Secure Bitcoin Signing Device (aka. Bitcoin Hardware Wallet)	",
    link: "https://lgt.st/ledger",
  },
  {
    category: "save",
    image: "seedsigner.jpeg",
    languageCodes: [getLanguageCode("English")],
    platforms: ["web"],
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nGP48/v3rx8//oMBw5F186YUBJgzMETqMjAcXDVzanGwAwdDloMgA0QBRBkAVfMgTgT6xiIAAAAASUVORK5CYII=",
    name: "SeedSigner",
    slogan: "SeedSigner: Air-gapped DIY Bitcoin Signing Device",
    link: "https://lgt.st/seedsigner",
  },
  {
    category: "save",
    image: "foundation.jpeg",
    languageCodes: [getLanguageCode("English")],
    platforms: ["web"],
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/ABAJD6uMhqWHgBAJDwDtvbLpzMa/o5/pu68Aknl0jHd1eWZjinFuAAcFDv/y5P/y5QcJD2rwGGtYvUViAAAAAElFTkSuQmCC",
    name: "Foundation",
    slogan:
      "Reclaim your sovereignty with the new standard for Bitcoin self custody. Introducing Passport hardware wallet and Envoy mobile app.",
    link: "https://lgt.st/foundation",
  },
  {
    category: "save",
    image: "bitbox.jpeg",
    languageCodes: [getLanguageCode("English")],
    platforms: ["web"],
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAO0lEQVR4nAXBwQ0AQAQEQJ/NJV66UIDQggI07qcMJbgZYmYziwhmpvded8+MiJCq7u7duTsByMyqAvABfUwPfGOPixEAAAAASUVORK5CYII=",
    name: "BitBox",
    slogan:
      "Swiss-made hardware and software for easy Bitcoin and cryptocurrency storage.",
    link: "https://lgt.st/foundation",
  },
];
