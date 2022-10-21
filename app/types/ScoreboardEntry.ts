export type ScoreboardEntry = {
  isMe: boolean;
  name: string | undefined;
  avatarURL: string | undefined;
  twitterUsername: string | undefined;
  successRate: number;
  numTipsWithdrawn: number;
  satsSent: number;
};
