import { buy } from "lib/items/buy";
import { donate } from "lib/items/donate";
import { earn } from "lib/items/earn";
import { learn } from "lib/items/learn";
import { save } from "lib/items/save";
import { send } from "lib/items/send";
import { spend } from "lib/items/spend";
import { tip } from "lib/items/tip";
import { wallets } from "lib/items/wallets";
import { Item, ItemCategory } from "types/Item";

export const catalog: Record<ItemCategory, Item[]> = {
  wallets,
  spend,
  buy,
  donate,
  earn,
  learn,
  save,
  send,
  tip,
};
