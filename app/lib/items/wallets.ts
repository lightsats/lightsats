import { getLanguageCode } from "lib/i18n/iso6391";
import { Wallet } from "types/Wallet";

const wos: Wallet = {
  id: "wos",
  category: "wallets",
  features: ["lnurl-withdraw", "lightning address", "lnurl-auth"],
  minBalance: 0,
  link: "https://lgt.st/walletofsatoshi",
  image: "wos.png",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAPUlEQVR4nGNQVlH6/9kzN0GFgUGeIdRX5f8P7+5KVS1NJQYFJaX1M1QvbNIXk1Jk4BdRDPVVkVdQ4hdRBACfdA3crpCdPAAAAABJRU5ErkJggg==",
  name: "Wallet Of Satoshi",
  slogan: "The world's simplest Bitcoin Lightning Wallet",
  instructions:
    "1. Download the Wallet of Satoshi app by clicking the Install ↗️ button below.\n2. Sign up for a Wallet of Satoshi account to enable login with lightning. You will get an email with magic words that you need to use to login to Wallet of Satoshi.\n3. Return to Lightsats to claim your tip.",
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
  id: "muun",
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
  id: "breez",
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

// blue temporarily disabled since they are stopping their lndhub service
/*const blue: Wallet = {
  id: "blue",
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
};*/

const alby: Wallet = {
  id: "alby",
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
  id: "phoenix",
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
  id: "lntips",
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
const obw: Wallet = {
  id: "obw",
  features: ["lnurl-auth", "lnurl-withdraw", "non-custodial"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/obw",
  image: "obw.webp",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAALElEQVR4nGP4/+g/HDGsav3PweDMzmBfFHaUoSD0sACnr5Rg2LVV/xmQlQEAPnQgO33asswAAAAASUVORK5CYII=",
  name: "OBW",
  slogan:
    "It is a simple, fast, intuitive wallet app, using advanced technology, open source, free, non-custodial, non-KYC.",
  languageCodes: [getLanguageCode("English")],
  platforms: ["android-only"],
};
const blink: Wallet = {
  id: "blink",
  features: ["lnurl-withdraw", "lightning address"],
  lightsatsRecommended: true,
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/bbw",
  image: "blink.png",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAANUlEQVR4nGP4////+eV9T87u+///P8P///+btRj2tGRBOH/FGVQYRGIhnH/1sw/N3nkFyAEAqOAjYOEgd8oAAAAASUVORK5CYII=",
  name: "Blink",
  slogan: "The everyday Bitcoin wallet",
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
const lifpay: Wallet = {
  id: "lifpay",
  features: ["lnurl-withdraw", "lnurl-auth", "lightning address"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/lifpay",
  image: "lifpay.jpeg",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAANUlEQVR4nGP4////+eV9T87u+///P8P///+btRj2tGRBOH/FGVQYRGIhnH/1sw/N3nkFyAEAqOAjYOEgd8oAAAAASUVORK5CYII=",
  name: "LifPay",
  slogan: "More Than A Bitcoin Lightning Wallet",
  languageCodes: [getLanguageCode("English")],
  platforms: ["mobile", "web"],
};
const mutiny: Wallet = {
  id: "mutiny",
  features: ["non-custodial"],
  category: "wallets",
  minBalance: 100000,
  link: "https://lgt.st/mutiny",
  image: "mutiny.png",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAANUlEQVR4nGP4////+eV9T87u+///P8P///+btRj2tGRBOH/FGVQYRGIhnH/1sw/N3nkFyAEAqOAjYOEgd8oAAAAASUVORK5CYII=",
  name: "Mutiny",
  slogan: "Unstoppable bitcoin. For everyone.",
  languageCodes: [getLanguageCode("English")],
  platforms: ["mobile", "web"],
};
const zeus: Wallet = {
  id: "zeus",
  features: ["lnurl-auth", "lnurl-withdraw", "non-custodial"],
  lightsatsRecommended: true,
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/zeus",
  image: "zeus.webp",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAP0lEQVR4nAE0AMv/AP/IJ//mMv/sRv/QQQD/4lKDdiV1dm3/5VsA//iZ3de+bWUq/9orAP/KLf/XPgABCPi0NiumHSY+n4GVAAAAAElFTkSuQmCC",
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
  id: "zebedee",
  features: ["lightning address"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/zebedee",
  image: "zebedee.jpeg",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAPElEQVR4nGMQFtfg4JTi4JQSk9RmqKyb9OXn/w9f/heVdTGUV/ffe/zjwbPfWblNDMLiGqwcUsxsEkBlAPPnExX6CVBpAAAAAElFTkSuQmCC",
  name: "ZEBEDEE",
  slogan:
    "We make the points you earn in games matter. By harnessing the power of Bitcoin, we attach real-world value to points, scores and economies in virtual worlds",
  languageCodes: [getLanguageCode("English")],
  platforms: ["mobile"],
};
const blixt: Wallet = {
  id: "blixt",
  features: ["lnurl-auth", "lnurl-withdraw", "non-custodial"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/blixt",
  image: "blixt.jpeg",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAOElEQVR4nGPYN4Xh6GyGfVNAiKEzieH/z8q7m/g6kxgYYs0YtvQw/H+cGWvGwGDNwmDLA0LWLAwAHQ0Q/Bk/+cgAAAAASUVORK5CYII=",
  name: "Blixt",
  slogan:
    "Blixt Wallet is a non-custodial open-source Bitcoin Lightning Wallet for Android with focus on usability and user experience, powered by lnd and Neutrino SPV.",
  languageCodes: [getLanguageCode("English")],
  platforms: ["android-only"],
};
const strike: Wallet = {
  id: "strike",
  features: ["lnurl-withdraw"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/strike",
  image: "strike.webp",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAJUlEQVR4nGNgQAYiIiL79++/deuWoKAgiJ+RkfHr1y9PT08UVQAE+Ao8BpEpowAAAABJRU5ErkJggg==",
  name: "Strike",
  slogan:
    "Buy and sell bitcoin. Strike offers the easiest way to buy bitcoin. Skip transaction fees and stack sats, the right way.",
  languageCodes: [getLanguageCode("English")],
  platforms: ["mobile", "desktop"],
};
const cashapp: Wallet = {
  id: "cashapp",
  features: ["lnurl-withdraw"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/cashapp",
  image: "cashapp.png",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGNg0GRgsGBgSGYAMRiUGNre5c//38GgzgASqHmWuvb/NLCMJliNI4gBABEUCpGscxy/AAAAAElFTkSuQmCC",
  name: "Cash App",
  slogan:
    "Cash App is the easy way to buy, sell, send, and receive the world's leading cryptocurrency. Buy bitcoin instantly in any amount—as little as $1.",
  languageCodes: [getLanguageCode("English")],
  platforms: ["mobile"],
};
const pouch: Wallet = {
  id: "pouch",
  features: ["lnurl-withdraw"],
  category: "wallets",
  minBalance: 0,
  link: "https://lgt.st/pouch",
  image: "pouch.jpeg",
  placeholderDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAANUlEQVR4nB3JsQmAMBQFwNvRpRxB+KRJsMgoqdzAVZ6S7uAwmLQNlZXnDDfae6WO0O3t1I8PuhYRDqtUbxoAAAAASUVORK5CYII=",
  name: "Pouch",
  slogan:
    "Made with ❤️ in the Philippines. Pouch supports philippine peso payments over bitcoin's Lightning Network ⚡",
  languageCodes: [getLanguageCode("English")],
  platforms: ["mobile"],
};
export const wallets: Wallet[] = [
  wos,
  // blue,
  muun,
  breez,
  alby,
  phoenix,
  lntips,
  obw,
  blink,
  lifpay,
  mutiny,
  zeus,
  zebedee,
  blixt,
  strike,
  cashapp,
  pouch,
];
