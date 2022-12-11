import { AchievementType } from "@prisma/client";

export type LeaderboardEntry = {
  userId: string;
  name: string | undefined;
  avatarURL: string | undefined;
  fallbackAvatarId: string | undefined;
  twitterUsername: string | undefined;
  successRate: number;
  numTipsWithdrawn: number;
  satsSent: number;
  numTipsSent: number;
  achievementTypes: AchievementType[];
};
