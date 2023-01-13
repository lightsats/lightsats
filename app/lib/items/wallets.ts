import { getLanguageCode } from "lib/i18n/iso6391";
import { Wallet } from "types/Wallet";

const wos: Wallet = {
  category: "wallets",
  features: ["lnurl-withdraw", "lightning address"],
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
const muun: Wallet = {
  category: "wallets",
  features: ["lnurl-withdraw", "non-custodial"],
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
  minBalance: 3000,
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
  features: ["lnurl-auth", "lnurl-withdraw"],
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
  features: [
    "lnurl-auth",
    "lnurl-withdraw",
    "non-custodial",
    "lightning address",
  ],
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
  features: ["lightning address"],
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
const obw: Wallet = {
  features: ["lnurl-auth", "lnurl-withdraw", "non-custodial"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/obw",
  image: "obw.webp",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAM0lEQVR4nGNgkEhicOtn0CwBMRgkkqx3fc65+p9BrZCBQTp18e//S/78h8owGNeCkEQSAJekECqxrsHvAAAAAElFTkSuQmCC",
  name: "OBW",
  slogan:
    "It is a simple, fast, intuitive wallet app, using advanced technology, open source, free, non-custodial, non-KYC.",
  languageCodes: [getLanguageCode("English")],
  platforms: ["android-only"],
};
const bbw: Wallet = {
  features: ["lnurl-auth", "lnurl-withdraw", "lightning address"],
  lightsatsRecommended: true,
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/bbw",
  image: "bbw.png",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/APX09re0qbOuo/j4+gD4+PcfFAAXBQDz8/MA9/j8QDscQz0e6+zuAP///+3t7Ovq6v///1l5IlUqU4AsAAAAAElFTkSuQmCC",
  name: "Bitcoin Beach Wallet",
  slogan:
    "The Bitcoin Beach Wallet, the most secure and accessible Lightning-enabled Bitcoin wallet that makes receiving, saving and spending Bitcoin easy.",
  languageCodes: [
    getLanguageCode("English"),
    getLanguageCode("Spanish"),
    getLanguageCode("Portuguese"),
    getLanguageCode("Czech"),
    getLanguageCode("German"),
    getLanguageCode("French"),
  ],
  platforms: ["mobile"],
};
const zeus: Wallet = {
  features: ["lnurl-auth", "lnurl-withdraw", "non-custodial"],
  lightsatsRecommended: true,
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/zeus",
  image: "zeus.webp",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/APX09re0qbOuo/j4+gD4+PcfFAAXBQDz8/MA9/j8QDscQz0e6+zuAP///+3t7Ovq6v///1l5IlUqU4AsAAAAAElFTkSuQmCC",
  name: "Zeus",
  slogan:
    "Zeus is an open-source, non-custodial Bitcoin wallet that gives you full control over how you make payments.",
  languageCodes: [
    getLanguageCode("English"),
    getLanguageCode("Spanish"),
    getLanguageCode("Portuguese"),
    getLanguageCode("Czech"),
    getLanguageCode("German"),
    getLanguageCode("French"),
  ],
  platforms: ["mobile"],
};
const zebedee: Wallet = {
  features: ["lightning address"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/zebedee",
  image: "zebedee.jpeg",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nB3JoRUAIAhFUXZgLkmsYvuL0ohG2qsevfUasD/AujszY8XMGODukt5UlaTzXTx1IMR3DRAKAAAAAElFTkSuQmCC",
  name: "ZEBEDEE",
  slogan:
    "We make the points you earn in games matter. By harnessing the power of Bitcoin, we attach real-world value to points, scores and economies in virtual worlds",
  languageCodes: [getLanguageCode("English")],
  platforms: ["mobile"],
};
const blixt: Wallet = {
  features: ["lnurl-auth", "lnurl-withdraw", "non-custodial"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/blixt",
  image: "blixt.jpeg",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAM0lEQVR4nGNgkEhicOtn0CwBMRgkkqx3fc65+p9BrZCBQTp18e//S/78h8owGNeCkEQSAJekECqxrsHvAAAAAElFTkSuQmCC",
  name: "Blixt",
  slogan:
    "Blixt Wallet is a non-custodial open-source Bitcoin Lightning Wallet for Android with focus on usability and user experience, powered by lnd and Neutrino SPV.",
  languageCodes: [getLanguageCode("English")],
  platforms: ["android-only"],
};
const strike: Wallet = {
  features: ["lnurl-withdraw"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/strike",
  image: "strike.webp",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nB3JoRUAIAhFUXZgLkmsYvuL0ohG2qsevfUasD/AujszY8XMGODukt5UlaTzXTx1IMR3DRAKAAAAAElFTkSuQmCC",
  name: "Strike",
  slogan:
    "Buy and sell bitcoin. Strike offers the easiest way to buy bitcoin. Skip transaction fees and stack sats, the right way.",
  languageCodes: [getLanguageCode("English")],
  platforms: ["mobile", "desktop"],
};
const cashapp: Wallet = {
  features: ["lnurl-withdraw"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/cashapp",
  image: "cashapp.png",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nB3JoRUAIAhFUXZgLkmsYvuL0ohG2qsevfUasD/AujszY8XMGODukt5UlaTzXTx1IMR3DRAKAAAAAElFTkSuQmCC",
  name: "Cash App",
  slogan:
    "Cash App is the easy way to buy, sell, send, and receive the world's leading cryptocurrency. Buy bitcoin instantly in any amount—as little as $1.",
  languageCodes: [getLanguageCode("English")],
  platforms: ["mobile"],
};
const pouch: Wallet = {
  features: ["lnurl-withdraw"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/cashapp",
  image: "pouch.jpeg",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nB3JoRUAIAhFUXZgLkmsYvuL0ohG2qsevfUasD/AujszY8XMGODukt5UlaTzXTx1IMR3DRAKAAAAAElFTkSuQmCC",
  name: "Pouch",
  slogan:
    "Made with ❤️ in the Philippines. Pouch supports philippine peso payments over bitcoin's Lightning Network ⚡",
  languageCodes: [getLanguageCode("English")],
  platforms: ["mobile"],
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
  obw,
  bbw,
  zeus,
  zebedee,
  blixt,
  strike,
  cashapp,
  pouch,
];
