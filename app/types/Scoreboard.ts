import { ScoreboardEntry } from "types/ScoreboardEntry";

export type Scoreboard = {
  totalSatsSent: number;
  numTipsSent: number;
  numUsersOnboarded: number;
  numTippers: number;
  entries: ScoreboardEntry[];
};
