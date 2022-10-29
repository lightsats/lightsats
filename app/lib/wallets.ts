import ISO6391 from "iso-639-1";
import { LightningWallet } from "types/LightningWallet";

const getLanguageCode = (languageName: string) => {
  const code = ISO6391.getCode(languageName);
  if (!code) {
    throw new Error("Unknown language: " + languageName);
  }
  return code;
};

const wos: LightningWallet = {
  minBalance: 0,
  link: "https://lgt.st/walletofsatoshi",
  image: "wos.png",
  name: "Wallet Of Satoshi",
  slogan: "The world's simplest Bitcoin Lightning Wallet",
  languageCodes: [
    getLanguageCode("Arabic"),
    getLanguageCode("Bulgarian"),
    getLanguageCode("Czech"),
    getLanguageCode("Deutsch"),
    getLanguageCode("English"),
    getLanguageCode("Spanish"),
    getLanguageCode("Persian"),
    getLanguageCode("Finnish"),
    getLanguageCode("French"),
    getLanguageCode("Croatian"),
    getLanguageCode("Italian"),
    getLanguageCode("Chinese"),
    getLanguageCode("Malay"),
    getLanguageCode("Norwegian"),
    getLanguageCode("Polish"),
    getLanguageCode("Portuguese"),
    getLanguageCode("Russian"),
    getLanguageCode("Swedish"),
    getLanguageCode("Thai"),
    getLanguageCode("Turkish"),
    getLanguageCode("Urdu"),
    getLanguageCode("Vietnamese"),
    getLanguageCode("Japanese"),
  ],
  platforms: ["mobile"],
};
//
// https://lgt.st/bluewallet
const muun: LightningWallet = {
  minBalance: 0,
  link: "https://lgt.st/muun",
  image: "muun.png",
  name: "Muun Wallet",
  slogan: "Simple and powerful. Just like bitcoin.",
  languageCodes: [getLanguageCode("English"), getLanguageCode("Spanish")],
  platforms: ["mobile"],
};

const breez: LightningWallet = {
  minBalance: 2000,
  link: "https://lgt.st/breez",
  image: "breez.png",
  name: "Breez Wallet",
  slogan: "LIGHTNING FAST BITCOIN PAYMENTS",
  languageCodes: [
    getLanguageCode("English"),
    getLanguageCode("Finnish"),
    getLanguageCode("French"),
    getLanguageCode("Italian"),
    getLanguageCode("Spanish"),
    getLanguageCode("Portuguese"),
  ],
  platforms: ["mobile"],
};

const blue: LightningWallet = {
  minBalance: 0,
  link: "https://lgt.st/bluewallet",
  image: "blue.png",
  name: "Blue Wallet",
  slogan: "Radically Simple & Powerful Bitcoin Wallet",
  languageCodes: [
    getLanguageCode("English"),
    getLanguageCode("Afrikaans"),
    getLanguageCode("Arabic"),
    getLanguageCode("Bulgarian"),
    getLanguageCode("Catalan"),
    getLanguageCode("Chinese"),
    getLanguageCode("Croatian"),
    getLanguageCode("Welsh"),
    getLanguageCode("Czech"),
    getLanguageCode("Danish"),
    getLanguageCode("German"),
    getLanguageCode("Spanish"),
    getLanguageCode("Greek"),
    getLanguageCode("Persian"),
    getLanguageCode("French"),
    getLanguageCode("Hebrew"),
    getLanguageCode("Italian"),
    getLanguageCode("Indonesian"),
    getLanguageCode("Hungarian"),
    getLanguageCode("Japanese"),
    getLanguageCode("Korean"),
    getLanguageCode("Malay"),
    getLanguageCode("Dutch"),
    getLanguageCode("Nepali"),
    getLanguageCode("Norwegian Bokmål"),
    getLanguageCode("Polish"),
    getLanguageCode("Portuguese"),
    getLanguageCode("Romanian"),
    getLanguageCode("Russian"),
    getLanguageCode("Sinhala"),
    getLanguageCode("Slovak"),
    getLanguageCode("Slovenian"),
    getLanguageCode("Finnish"),
    getLanguageCode("Swedish"),
    getLanguageCode("Thai"),
    getLanguageCode("Vietnamese"),
    getLanguageCode("Turkish"),
    getLanguageCode("Xhosa"),
  ],
  platforms: ["mobile"],
};

const alby: LightningWallet = {
  minBalance: 0,
  link: "https://getalby.com/",
  image: "alby.png",
  name: "Alby Wallet",
  slogan: "Lightning buzz for your Browser!",
  languageCodes: [
    getLanguageCode("English"),
    getLanguageCode("Spanish"),
    getLanguageCode("Portuguese"),
  ],
  platforms: ["desktop"],
};
export const wallets: LightningWallet[] = [wos, blue, muun, breez, alby];
