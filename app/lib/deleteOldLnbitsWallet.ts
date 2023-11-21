import { LnbitsWallet } from "@prisma/client";
import { deleteLnbitsUser } from "lib/lnbits/deleteLnbitsUser";
import prisma from "lib/prismadb";

export async function deleteOldLnbitsWallet(lnbitsWallet: LnbitsWallet) {
  if (
    lnbitsWallet &&
    process.env.LNBITS_MIGRATION_SKIP_OLD_WALLETS !== "true"
  ) {
    try {
      await deleteLnbitsUser(lnbitsWallet.lnbitsUserId);
    } catch (error) {
      console.warn("Failed to delete LNbits user", error);
    }
    await prisma.lnbitsWallet.delete({
      where: {
        id: lnbitsWallet.id,
      },
    });
  }
}
