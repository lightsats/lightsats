import {
  createLnbitsUserAndWallet,
  generateUserAndWalletName,
} from "lib/lnbits/createLnbitsUserAndWallet";
import prisma from "lib/prismadb";

export async function prepareFundingWallet(
  tipId: string | undefined,
  tipGroupId: string | undefined
) {
  if (!tipId && !tipGroupId) {
    throw new Error("Either tipId or tipGroupId must be provided");
  }
  // create a user and wallet for the tip
  const { createLnbitsUserResponse, createLnbitsUserResponseBody } =
    await createLnbitsUserAndWallet(
      generateUserAndWalletName(
        tipId ? "tip" : "tipGroup",
        (tipId ?? tipGroupId) as string
      )
    );

  if (!createLnbitsUserResponse.ok) {
    console.error(
      "Failed to create lnbits user+wallet for tip/tip group",
      createLnbitsUserResponseBody
    );

    throw new Error("Failed to create lnbits user+wallet for tip/tip group");
  }

  const lnbitsWallet = createLnbitsUserResponseBody.wallets[0];
  try {
    // save the newly-created lnbits wallet (for creating/paying invoice)
    await prisma.lnbitsWallet.create({
      data: {
        tipId: tipId,
        tipGroupId: tipGroupId,
        id: lnbitsWallet.id,
        lnbitsUserId: lnbitsWallet.user,
        adminKey: lnbitsWallet.adminkey,
      },
    });
  } catch (error) {
    console.error(
      "Failed to save tip/tip group lnbits wallet to database",
      error
    );
    throw new Error("Failed to save tip/tip group lnbits wallet to database");
  }
  return lnbitsWallet.adminkey;
}
