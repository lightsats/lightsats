import { Item } from "types/Item";

type WalletFeature =
  | "lnurl-auth"
  | "lnurl-withdraw"
  | "non-custodial"
  | "lightning address";

export type Wallet = Item & {
  id: string;
  minBalance: number;
  features: WalletFeature[];
};
