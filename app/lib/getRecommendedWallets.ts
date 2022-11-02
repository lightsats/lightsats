import ISO6391 from "iso-639-1";
import { wallets } from "lib/wallets";
import { Wallet } from "types/Wallet";

export function getRecommendedWallets(
  tipAmount: number,
  languageCode: string
): Wallet[] {
  if (!ISO6391.validate(languageCode)) {
    throw new Error("Unsupported language code: " + languageCode);
  }
  const recommendedWallets = wallets.filter(
    (wallet) =>
      wallet.languageCodes.indexOf(languageCode) > -1 &&
      wallet.minBalance <= tipAmount
  );
  sortWallets(recommendedWallets);

  return recommendedWallets;
}

export function sortWallets(wallets: Wallet[]) {
  wallets.sort((a, b) => getWalletScore(b) - getWalletScore(a));
}

function getWalletScore(wallet: Wallet) {
  let score = 0;
  if (wallet.lightsatsRecommended) {
    ++score;
  }
  if (wallet.features.indexOf("lnurl-auth") > -1) {
    ++score;
  }
  if (wallet.platforms.indexOf("mobile") > -1) {
    ++score;
  }

  return score;
}
