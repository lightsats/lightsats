import { getLanguageCode } from "lib/i18n/iso6391";
import { Wallet } from "types/Wallet";

const wos: Wallet = {
  category: "wallets",
  features: ["lnurl-withdraw"],
  minBalance: 0,
  link: "https://lgt.st/walletofsatoshi",
  image: "wos.png",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAPUlEQVR4nGNQVlH6/9kzN0GFgUGeIdRX5f8P7+5KVS1NJQYFJaX1M1QvbNIXk1Jk4BdRDPVVkVdQ4hdRBACfdA3crpCdPAAAAABJRU5ErkJggg==",
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
const muun: Wallet = {
  category: "wallets",
  features: ["lnurl-withdraw"],
  minBalance: 0,
  link: "https://lgt.st/muun",
  image: "muun.png",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/AABDmQBGnQA7kQAdcwAAY7bL//+58f8ARZoAAFirJ4rYIofUAE2gAAAgdgAdcgAZbQARZehsEZ3ZbJxEAAAAAElFTkSuQmCC",
  name: "Muun Wallet",
  slogan: "Simple and powerful. Just like bitcoin.",
  languageCodes: [getLanguageCode("English"), getLanguageCode("Spanish")],
  platforms: ["mobile"],
};

const breez: Wallet = {
  features: ["lnurl-auth", "lnurl-withdraw", "non-custodial"],
  lightsatsRecommended: true,
  category: "wallets",
  minBalance: 2000,
  link: "https://lgt.st/breez",
  image: "breez.png",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAABnWAAAZ1gEY0crtAAAAP0lEQVR4nAE0AMv/AP////v7/ODn7P///wDz9vcAOFsAHEH19vgA+/v8AERmABY85uvvAP////n6+9vi6P///7k8JI6gkKogAAAAAElFTkSuQmCC",
  name: "Breez Wallet",
  slogan: "Lightning fast bitcoin payments.",
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

const blue: Wallet = {
  features: ["lnurl-auth", "lnurl-withdraw", "non-custodial"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/bluewallet",
  image: "blue.png",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/AAAAVgAPYgAPYQAAVAAAXLsAfN0AeNkAWroAg+f/qP//u///l/P/AGfO+nnY/4/k/4Dc/997Gf6eenRqAAAAAElFTkSuQmCC",
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

const alby: Wallet = {
  features: ["lnurl-auth", "lnurl-withdraw", "non-custodial"],
  lightsatsRecommended: true,
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/alby",
  image: "alby.png",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/APX09re0qbOuo/j4+gD4+PcfFAAXBQDz8/MA9/j8QDscQz0e6+zuAP///+3t7Ovq6v///1l5IlUqU4AsAAAAAElFTkSuQmCC",
  name: "Alby Wallet",
  slogan: "Lightning buzz for your Browser!",
  languageCodes: [
    getLanguageCode("English"),
    getLanguageCode("Spanish"),
    getLanguageCode("Portuguese"),
  ],
  platforms: ["desktop"],
};
const phoenix: Wallet = {
  features: ["lnurl-auth", "lnurl-withdraw", "non-custodial"],
  category: "wallets",
  minBalance: 10000,
  link: "https://lgt.st/phoenix",
  image: "phoenix.jpeg",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/AP///8jPx87TzP///wDX3NZKXUYAGwCAj34ArberECsMJj4hxc3EAPT19NTa0/z9/P///0JGIGVwaLfEAAAAAElFTkSuQmCC",
  name: "Phoenix",
  slogan: "The Bitcoin wallet from the future",
  languageCodes: [getLanguageCode("English")],
  platforms: ["mobile"],
};
const lntips: Wallet = {
  features: [],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/lntips",
  image: "lntips.jpeg",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAPUlEQVR4nGNgZfER5AhmYPBgYPBkMGNI2l1248XV/0riCQxOjDmTU/f8//h/Ss1xBkYWHwYGFwYGNxY2HwCGSQ+j4puuEwAAAABJRU5ErkJggg==",
  name: "lntips (Telegram)",
  slogan: "Bitcoin Lightning wallet on Telegram.",
  languageCodes: [getLanguageCode("English")],
  platforms: ["mobile"],
};
const lntxbot: Wallet = {
  features: [],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/lntxbot",
  image: "lntxbot.jpeg",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nB3JoRUAIAhFUXZgLkmsYvuL0ohG2qsevfUasD/AujszY8XMGODukt5UlaTzXTx1IMR3DRAKAAAAAElFTkSuQmCC",
  name: "lntxbot (Telegram)",
  slogan: "A Bitcoin Lightning wallet on Telegram.",
  languageCodes: [getLanguageCode("English")],
  platforms: ["mobile"],
};
const sbw: Wallet = {
  features: ["lnurl-auth", "lnurl-withdraw", "non-custodial"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/sbw",
  image: "sbw.webp",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAM0lEQVR4nGNgkEhicOtn0CwBMRgkkqx3fc65+p9BrZCBQTp18e//S/78h8owGNeCkEQSAJekECqxrsHvAAAAAElFTkSuQmCC",
  name: "Simple Bitcoin Wallet",
  slogan:
    "Simple Bitcoin Wallet (aka SBW) is an open-source, non-custodial, autonomous wallet for Android devices which can store, send and receive bitcoins.",
  languageCodes: [getLanguageCode("English")],
  platforms: ["android-only"],
};
export const wallets: Wallet[] = [
  wos,
  blue,
  muun,
  breez,
  alby,
  phoenix,
  lntips,
  lntxbot,
  sbw,
];
