import { ScoreboardEntry } from "types/ScoreboardEntry";

export type Scoreboard = {
  totalSatsSent: number;
  numUsersOnboarded: number;
  entries: ScoreboardEntry[];
};
