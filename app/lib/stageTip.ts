// move a tip to a user's staging wallet in preparation for withdrawal

import { WithdrawalFlow } from "@prisma/client";
import { createUserStagingLnbitsWallet } from "lib/createUserStagingLnbitsWallet";
import { createInvoice } from "lib/lnbits/createInvoice";
import { payInvoice } from "lib/lnbits/payInvoice";
import prisma from "lib/prismadb";
import { TipWithWallet } from "types/TipWithWallet";

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
    userWallet = await createUserStagingLnbitsWallet(userId);
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

    const { payInvoiceResponse, payInvoiceResponseBody } = await payInvoice(
      invoice,
      fromWalletAdminKey
    );
    if (!payInvoiceResponse.ok) {
      throw new Error(
        "Failed to move tip " +
          tip.id +
          " to staging wallet. Withdrawal flow = " +
          flow +
          ": " +
          payInvoiceResponse.status +
          " " +
          payInvoiceResponse.statusText +
          " " +
          JSON.stringify(payInvoiceResponseBody)
      );
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
