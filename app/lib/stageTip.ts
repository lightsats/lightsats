// move a tip to a user's staging wallet in preparation for withdrawal

import { LnbitsWallet, Tip, WithdrawalFlow } from "@prisma/client";
import {
  createInvoice,
  createLnbitsUserAndWallet,
  enableLnbitsExtension,
  generateUserAndWalletName,
  payInvoice,
} from "lib/lnbits";
import prisma from "lib/prismadb";

type TipWithWallet = Tip & {
  lnbitsWallet: LnbitsWallet | null;
};

export async function stageTip(
  userId: string,
  tip: TipWithWallet,
  flow: WithdrawalFlow
) {
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }

  if (flow !== "tippee" && flow !== "tipper") {
    throw new Error("Unsupported withdrawal flow: " + flow);
  }

  // create user staging wallet if it doesn't exist
  // funds will be moved into the user's staging wallet so that they can withdraw multiple tips with a single invoice
  let userWallet = await prisma.lnbitsWallet.findUnique({
    where: {
      userId,
    },
  });

  if (!userWallet) {
    console.log("Creating new staging wallet for user " + userId);
    const { createLnbitsUserResponse, createLnbitsUserResponseBody } =
      await createLnbitsUserAndWallet(
        generateUserAndWalletName("user", userId)
      );
    if (!createLnbitsUserResponse.ok) {
      console.error(
        "Failed to create lnbits user+wallet for user",
        createLnbitsUserResponseBody
      );

      throw new Error("Failed to create lnbits user+wallet for user");
    }

    const lnbitsWallet = createLnbitsUserResponseBody.wallets[0];

    // enable lnurl-withdraw extension on user wallet
    if (!(await enableLnbitsExtension(lnbitsWallet.user, "withdraw"))) {
      throw new Error("Failed to enable LNURLw extension on user wallet");
    }

    // save the newly-created lnbits wallet (for creating/paying invoice)
    userWallet = await prisma.lnbitsWallet.create({
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
  } else {
    console.log("user " + userId + " already has a staging wallet");
  }

  try {
    if (!tip.lnbitsWallet) {
      throw new Error("Tip " + tip.id + " has no lnbitsWallet");
    }
    // move tip & tip fee from tip wallet to receiving user's staging wallet (tippee for claiming, tipper for reclaiming)
    // if the tip is already claimed then it is in the tippee's staging wallet
    let fromWalletAdminKey = tip.lnbitsWallet.adminKey;
    if (tip.status === "CLAIMED") {
      if (!tip.tippeeId) {
        throw new Error(
          "Unable to reclaim tip " + tip.id + " because it has no tippeeId"
        );
      }
      const tippeeWallet = await prisma.lnbitsWallet.findUnique({
        where: {
          userId: tip.tippeeId,
        },
      });
      if (!tippeeWallet) {
        throw new Error(
          "Unable to reclaim tip " +
            tip.id +
            " because tippee " +
            tip.tippeeId +
            " has no wallet"
        );
      }
      fromWalletAdminKey = tippeeWallet.adminKey;
    }

    const { invoice } = await createInvoice(
      tip.amount + tip.fee,
      userWallet.adminKey,
      "send to user " + userId + ` (${flow} flow)`,
      undefined
    );

    const { payInvoiceResponse } = await payInvoice(
      invoice,
      fromWalletAdminKey
    );
    if (!payInvoiceResponse.ok) {
      throw new Error(
        "Failed to move tip " +
          tip.id +
          " to staging wallet. Withdrawal flow = " +
          flow
      );
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
