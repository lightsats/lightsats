import { DevicePlatform } from "hooks/useDevicePlatform";
import { validateLanguageCode } from "lib/i18n/iso6391";
import { DEFAULT_LOCALE } from "lib/i18n/locales";
import { catalog } from "lib/items/catalog";
import { Item, ItemCategory } from "types/Item";
import { Wallet } from "types/Wallet";

export type CategoryFilterOptions = {
  tippeeBalance?: number;
  checkTippeeBalance?: boolean;
  lnurlAuthCapable?: boolean;
  recommendedLimit?: number;
  filterOtherItems?: boolean;
  recommendedItemId?: string;
  sortAlphabetically?: boolean;
  shadow?: boolean; // TODO: move somewhere else
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
  locale: string | undefined,
  devicePlatform: DevicePlatform | undefined,
  options: CategoryFilterOptions
): Item[] {
  if (locale && !validateLanguageCode(locale)) {
    throw new Error("Unsupported locale: " + locale);
  }
  const categoryItems = catalog[category];
  let recommendedItems = categoryItems.filter(
    (item) =>
      (options.recommendedItemId && item.id === options.recommendedItemId) ||
      ((!locale || item.languageCodes.indexOf(locale) > -1) &&
        (!devicePlatform || osMatches(item, devicePlatform, false)))
  );
  recommendedItems =
    categoryFilterFunctions[category]?.(recommendedItems, options) ??
    recommendedItems;

  sortItems(
    recommendedItems,
    categoryScoringFuncs[category],
    locale,
    devicePlatform,
    options
  );
  const limit = options.recommendedLimit;
  return recommendedItems.slice(0, limit);
}

export function getOtherItems(
  category: ItemCategory,
  options: CategoryFilterOptions,
  recommendedItems: Item[],
  locale: string,
  devicePlatform: DevicePlatform
) {
  const categoryItems = catalog[category];
  let otherItems = categoryItems.filter(
    (item) => recommendedItems.indexOf(item) === -1
  );
  if (options.filterOtherItems) {
    otherItems =
      categoryFilterFunctions[category]?.(otherItems, options) ?? otherItems;
  }
  sortItems(
    otherItems,
    categoryScoringFuncs[category],
    locale,
    devicePlatform,
    options
  );
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
  scoringFunc: ScoringFunction | undefined,
  locale: string | undefined,
  devicePlatform: DevicePlatform | undefined,
  options: CategoryFilterOptions
) {
  if (options.sortAlphabetically) {
    items.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    items.sort(
      (a, b) =>
        getItemScore(b, scoringFunc, locale, devicePlatform, options) -
        getItemScore(a, scoringFunc, locale, devicePlatform, options)
    );
  }
}

function getItemScore(
  item: Item,
  scoringFunc: ScoringFunction | undefined,
  locale: string | undefined,
  devicePlatform: DevicePlatform | undefined,
  options: CategoryFilterOptions
) {
  let score = 0;
  if (item.lightsatsRecommended) {
    ++score;
  }
  if (locale && item.languageCodes.indexOf(locale) > -1) {
    score += 5;
  } else if (item.languageCodes.indexOf(DEFAULT_LOCALE) > -1) {
    score += 2;
  }

  if (devicePlatform && osMatches(item, devicePlatform, true)) {
    score += 5;
  }

  if (options.recommendedItemId && item.id === options.recommendedItemId) {
    score += 999999;
  }

  if (scoringFunc) {
    score += scoringFunc(item);
  }
  return score;
}

function osMatches(
  item: Item,
  devicePlatform: DevicePlatform,
  strictDesktopCheck: boolean
) {
  return (
    item.platforms.indexOf("web") > -1 ||
    (!devicePlatform.isMobile &&
      (!strictDesktopCheck || item.platforms.indexOf("desktop") > -1)) ||
    (devicePlatform.isMobile && item.platforms.indexOf("mobile") > -1) ||
    (devicePlatform.isIos && item.platforms.indexOf("ios-only") > -1) ||
    (devicePlatform.isAndroid && item.platforms.indexOf("android-only") > -1)
  );
}

function getWalletScore(item: Item) {
  const wallet = item as Wallet;
  let score = 0;
  if (wallet.features.indexOf("lnurl-auth") > -1) {
    ++score;
  }
  if (wallet.features.indexOf("non-custodial") > -1) {
    ++score;
  }
  if (wallet.features.indexOf("lightning address") > -1) {
    ++score;
  }
  if (wallet.platforms.indexOf("mobile") > -1) {
    ++score;
  }

  return score;
}
