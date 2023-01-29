import {
  LnbitsWallet,
  SentReminder,
  Tip,
  TipStatus,
  User,
  Withdrawal,
  WithdrawalError,
} from "@prisma/client";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export type AdminDashboard = {
  adminUsers: User[];
  lnbitsDashboardUrl: string;
  walletBalance: number;
  smsForSatsAccountBalance: number;
};

export type AdminExtendedUser = User & {
  tipsSent: Tip[];
  lnbitsWallet: LnbitsWallet | null;
  tipsReceived: Tip[];
  lnbitsWalletUrl: string | undefined;
  walletBalance: number;
  withdrawals: AdminExtendedWithdrawal[];
  withdrawalErrors: AdminExtendedWithdrawalError[];
  tipGroups: TipGroupWithTips[];
};

export type AdminExtendedTip = Tip & {
  tipper: User;
  tippee: User | null;
  sentReminders: SentReminder[];
  withdrawal: AdminExtendedWithdrawal | null;
  withdrawalErrors: AdminExtendedWithdrawalError[];
  lnbitsWallet: LnbitsWallet | null;
  lnbitsWalletUrl: string | undefined;
  walletBalance: number;
  group: TipGroupWithTips | null;
};

export type AdminExtendedTipGroup = TipGroupWithTips & {
  lnbitsWallet: LnbitsWallet | null;
  lnbitsWalletUrl: string | undefined;
  walletBalance: number;
  tipper: User;
};

export type AdminExtendedWithdrawal = Withdrawal & {
  tips: Tip[];
  user: User | null;
};
export type AdminExtendedWithdrawalError = WithdrawalError & {
  user: User | null;
  tip: Tip | null;
};

export type AdminTipChangeStatusRequest = {
  status: TipStatus;
};
