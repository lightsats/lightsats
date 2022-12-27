import { LeaderboardTheme } from "@prisma/client";

export type LeadboardRequestBase = {
  title: string;
  startDate: string;
  endDate: string;
  theme: LeaderboardTheme | undefined;
};

export type CreateLeaderboardRequest = LeadboardRequestBase;
export type UpdateLeaderboardRequest = LeadboardRequestBase;
