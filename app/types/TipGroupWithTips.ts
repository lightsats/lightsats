import { Tip, TipGroup } from "@prisma/client";

export type TipGroupWithTips = TipGroup & { tips: Tip[] };
