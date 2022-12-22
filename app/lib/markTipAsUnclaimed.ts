import { Tip } from "@prisma/client";
import { TIP_NUM_SMS_TOKENS } from "lib/constants";
import prisma from "lib/prismadb";

export function markTipAsUnclaimed(tip: Tip): Promise<Tip> {
  return prisma.tip.update({
    data: {
      status: "UNCLAIMED",
      numSmsTokens: TIP_NUM_SMS_TOKENS,
    },
    where: {
      id: tip.id,
    },
  });
}
