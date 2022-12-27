import { Tip } from "@prisma/client";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export type TipWithGroup = Tip & {
  group?: TipGroupWithTips;
};
