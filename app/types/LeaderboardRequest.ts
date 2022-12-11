export type LeadboardRequestBase = {
  title: string;
  startDate: string;
  endDate: string;
};

export type CreateLeaderboardRequest = LeadboardRequestBase;
export type UpdateLeaderboardRequest = LeadboardRequestBase;
