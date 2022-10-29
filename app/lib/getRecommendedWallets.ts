import ISO6391 from "iso-639-1";
import { wallets } from "lib/wallets";
import { LightningWallet } from "types/LightningWallet";

export function getRecommendedWallets(
  amount: number,
  languageCode: string
): LightningWallet[] {
  if (!ISO6391.validate(languageCode)) {
    throw new Error("Unsupported language code: " + languageCode);
  }
  return wallets.filter(
    (wallet) =>
      wallet.languageCodes.indexOf(languageCode) > -1 &&
      wallet.minBalance <= amount
  );
}
