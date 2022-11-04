import { Item } from "types/Item";

export type Difficulty = "easy" | "medium" | "hard";

export type LearnItem = Item & {
  difficulty: Difficulty;
};
