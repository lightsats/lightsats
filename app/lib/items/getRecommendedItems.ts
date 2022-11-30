import { validateLanguageCode } from "lib/i18n/iso6391";
import { catalog } from "lib/items/catalog";
import { Item, ItemCategory } from "types/Item";
import { Wallet } from "types/Wallet";

export type CategoryFilterOptions = {
  tippeeBalance?: number;
  checkTippeeBalance?: boolean;
  lnurlAuthCapable?: boolean;
  recommendedLimit?: number;
  filterOtherItems?: boolean;
  shadow?: boolean;
};

type ScoringFunction = (item: Item) => number;

const categoryFilterFunctions: Partial<
  Record<
    ItemCategory,
    (items: Item[], options: CategoryFilterOptions) => Item[]
  >
> = {
  wallets: getRecommendedWallets,
};
const categoryScoringFuncs: Partial<Record<ItemCategory, ScoringFunction>> = {
  wallets: getWalletScore,
};

export function getRecommendedItems(
  category: ItemCategory,
  locale: string,
  options: CategoryFilterOptions
): Item[] {
  if (!validateLanguageCode(locale)) {
    throw new Error("Unsupported locale: " + locale);
  }
  const categoryItems = catalog[category];
  let recommendedItems = categoryItems.filter(
    (item) => item.languageCodes.indexOf(locale) > -1
  );
  recommendedItems =
    categoryFilterFunctions[category]?.(recommendedItems, options) ??
    recommendedItems;

  sortItems(recommendedItems, categoryScoringFuncs[category]);
  const limit =
    category === "wallets" && !options.lnurlAuthCapable ? 1 : undefined;
  return recommendedItems.slice(0, limit);
}

export function getOtherItems(
  category: ItemCategory,
  options: CategoryFilterOptions,
  recommendedItems: Item[]
) {
  const categoryItems = catalog[category];
  let otherItems = categoryItems.filter(
    (item) => recommendedItems.indexOf(item) === -1
  );
  if (options.filterOtherItems) {
    otherItems =
      categoryFilterFunctions[category]?.(otherItems, options) ?? otherItems;
  }
  sortItems(otherItems, categoryScoringFuncs[category]);
  return otherItems;
}

export function getRecommendedWallets(
  items: Item[],
  options: CategoryFilterOptions
): Item[] {
  const recommendedWallets = (items as Wallet[]).filter(
    (wallet) =>
      (!options.checkTippeeBalance ||
        wallet.minBalance <= (options.tippeeBalance ?? 0)) &&
      (!options.lnurlAuthCapable || wallet.features.indexOf("lnurl-auth") > -1)
  );

  return recommendedWallets;
}

export function sortItems(
  items: Item[],
  scoringFunc: ScoringFunction | undefined
) {
  items.sort(
    (a, b) => getItemScore(b, scoringFunc) - getItemScore(a, scoringFunc)
  );
}

function getItemScore(item: Item, scoringFunc: ScoringFunction | undefined) {
  let score = 0;
  if (item.lightsatsRecommended) {
    ++score;
  }
  // TODO: score languages (native +10, English +5, others +0)
  if (scoringFunc) {
    score += scoringFunc(item);
  }
  return score;
}

function getWalletScore(item: Item) {
  const wallet = item as Wallet;
  let score = 0;
  if (wallet.features.indexOf("lnurl-auth") > -1) {
    ++score;
  }
  if (wallet.platforms.indexOf("mobile") > -1) {
    ++score;
  }

  return score;
}
