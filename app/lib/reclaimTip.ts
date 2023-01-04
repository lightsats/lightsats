import { refundableTipStatuses } from "lib/constants";
import prisma from "lib/prismadb";
import { stageTip } from "lib/stageTip";
import { TipWithWallet } from "types/TipWithWallet";

export async function reclaimTip(tip: TipWithWallet) {
  if (refundableTipStatuses.indexOf(tip.status) < 0) {
    throw new Error(
      "Could not refund tip " + tip.id + ": unexpected status " + tip.status
    );
  }
  await stageTip(tip.tipperId, tip, "tipper");
  await prisma.tip.update({
    where: {
      id: tip.id,
    },
    data: {
      status: "RECLAIMED",
      tippeeId: tip.tipperId, // TODO: shouldn't this be set to null?
    },
  });
}
