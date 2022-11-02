import { Item } from "types/Item";

type WalletFeature = "lnurl-auth" | "lnurl-withdraw";

export type Wallet = Item & {
  minBalance: number;
  features: WalletFeature[];
};
