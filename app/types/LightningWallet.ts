type LightningWalletPlatform = "mobile" | "desktop";

export type LightningWallet = {
  name: string;
  link: string;
  slogan: string;
  image: string;
  languageCodes: string[];
  minBalance: number;
  platforms: LightningWalletPlatform[];
};
