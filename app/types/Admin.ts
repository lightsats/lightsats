import { Tip, User, Withdrawal } from "@prisma/client";

export type AdminDashboard = {
  adminUsers: User[];
  lnbitsDashboardUrl: string;
  tips: Tip[];
  withdrawals: Withdrawal[];
};
