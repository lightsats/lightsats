export type ScoreboardEntry = {
  userId: string;
  isMe: boolean;
  name: string | undefined;
  avatarURL: string | undefined;
  fallbackAvatarId: string | undefined;
  twitterUsername: string | undefined;
  successRate: number;
  numTipsWithdrawn: number;
  satsSent: number;
  numTipsSent: number;
};
