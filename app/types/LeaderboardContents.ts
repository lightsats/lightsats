import { LeaderboardEntry } from "types/LeaderboardEntry";

export type LeaderboardContents = {
  totalSatsSent: number;
  numTipsSent: number;
  numUsersOnboarded: number;
  numTippers: number;
  entries: LeaderboardEntry[];
};
