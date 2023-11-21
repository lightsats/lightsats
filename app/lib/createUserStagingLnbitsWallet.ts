import { LnbitsWallet } from "@prisma/client";
import {
  createLnbitsUserAndWallet,
  generateUserAndWalletName,
} from "lib/lnbits/createLnbitsUserAndWallet";
import prisma from "lib/prismadb";

export async function createUserStagingLnbitsWallet(
  userId: string
): Promise<LnbitsWallet> {
  console.log("Creating new staging wallet for user " + userId);
  const { createLnbitsUserResponse, createLnbitsUserResponseBody } =
    await createLnbitsUserAndWallet(generateUserAndWalletName("user", userId));
  if (!createLnbitsUserResponse.ok) {
    console.error(
      "Failed to create lnbits user+wallet for user",
      createLnbitsUserResponseBody
    );

    throw new Error("Failed to create lnbits user+wallet for user");
  }

  const lnbitsWallet = createLnbitsUserResponseBody.wallets[0];

  // save the newly-created lnbits wallet (for creating/paying invoice)
  const userWallet = await prisma.lnbitsWallet.create({
    data: {
      userId,
      id: lnbitsWallet.id,
      lnbitsUserId: lnbitsWallet.user,
      adminKey: lnbitsWallet.adminkey,
    },
  });
  if (!userWallet) {
    throw new Error("user lnbits wallet was not created");
  }
  return userWallet;
}
