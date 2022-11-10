import { getLanguageCode } from "lib/items/getLanguageCode";
import { Item } from "types/Item";

export const spend: Item[] = [
  {
    category: "spend",
    image: "btcmap.svg",
    languageCodes: [getLanguageCode("English")],
    link: "https://lgt.st/btcmap",
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMUlEQVR4nGNgyPJi6C9iKEhk8D28cu//3wzxHQwMiycv+Pufgd+AgSE2iKGxnaEgGQAntA55KRb8XgAAAABJRU5ErkJggg==",
    name: "BTC Map",
    slogan: "Easily find places to spend sats anywhere on the planet.",
    platforms: ["web", "mobile"],
  },
  {
    category: "spend",
    image: "moon.jpg",
    languageCodes: [getLanguageCode("English")],
    link: "https://lgt.st/moon",
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAOElEQVR4nAXBoQ0AQAgDQCTiVRMUYdpqNDsxQidB/p0BqKrMBGAkJe0uSevuu5M0M+buEQHgvfcB5u4SplG5KjAAAAAASUVORK5CYII=",
    name: "Moon",
    slogan:
      "Purchase Moon Visa® Prepaid Cards with bitcoin. Pay at millions of online merchants with secure virtual cards.",
    platforms: ["web", "desktop"],
  },
  {
    category: "spend",
    image: "bitrefill.png",
    languageCodes: [getLanguageCode("English")],
    link: "https://lgt.st/bitrefill",
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/AAAVDwAyMAAwLQAYEQAAFxGDpqTGx8hKCBgAAB0ZyLi6/87d/25NAAANCv9hWP9uVv9uRWGhEdk7IjWSAAAAAElFTkSuQmCC",
    name: "Bitrefill",
    slogan:
      "Purchase Gift Cards & Mobile Recharges in 170+ countries with BTC.",
    platforms: ["web", "mobile"],
  },
  {
    category: "spend",
    image: "thebitcoincompany.jpg",
    languageCodes: [getLanguageCode("English")],
    link: "https://lgt.st/thebitcoincompany",
    name: "The Bitcoin Company",
    slogan: "The easiest way to spend bitcoin and earn rewards.",
    platforms: ["mobile"],
  },
  {
    category: "spend",
    image: "lightningstore.jpeg",
    languageCodes: [getLanguageCode("English")],
    link: "https://lgt.st/lightningstore",
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAOklEQVR4nGPg4uQUk5SQVVJkY2FlYGBgOPX/07Lbp0AsNhZWI1dbaQU5Xh4eBk52dlMrB3ffUEYGBgDssgjKc7unUgAAAABJRU5ErkJggg==",
    name: "Lightning Store⚡",
    slogan: "Obscure Bitcoin pop cult/punk mashups 4 sale ⛓⚡️",
    platforms: ["web"],
  },
  {
    category: "spend",
    image: "ibexpay.jpeg",
    languageCodes: [getLanguageCode("English")],
    link: "https://lgt.st/ibexpay",
    placeholderDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/AP///7i8zrO4yv///wDGydgAEUk+THnP0d4A1tjjAABAM0JytrrNAP///9/g6Ly+0Pn5+l/9IYM3mGUoAAAAAElFTkSuQmCC",
    name: "iBEXPay",
    slogan:
      "IBEX is a bitcoin infrastructure company specialized in the Lightning Network (LN) enterprise solutions.",
    platforms: ["web", "mobile"],
  },
];
