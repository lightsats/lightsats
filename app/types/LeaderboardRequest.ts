import { LeaderboardTheme } from "@prisma/client";

export type LeadboardRequestBase = {
  title: string;
  startDate: string;
  endDate: string | undefined;
  theme: LeaderboardTheme | undefined;
  isGlobal: boolean;
};

export type CreateLeaderboardRequest = LeadboardRequestBase;
export type UpdateLeaderboardRequest = LeadboardRequestBase;
