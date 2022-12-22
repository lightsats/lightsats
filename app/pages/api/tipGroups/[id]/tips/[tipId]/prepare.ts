import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { createInvoice } from "lib/lnbits/createInvoice";
import { getWalletBalance } from "lib/lnbits/getWalletBalance";
import { payInvoice } from "lib/lnbits/payInvoice";
import { markTipAsUnclaimed } from "lib/markTipAsUnclaimed";
import { prepareFundingWallet } from "lib/prepareFundingWallet";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TipGroupWithTips>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  switch (req.method) {
    case "POST":
      return handlePrepareTip(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handlePrepareTip(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<TipGroupWithTips>
) {
  const { id, tipId } = req.query;

  const tipGroup = await prisma.tipGroup.findUnique({
    where: {
      id: id as string,
    },
    include: {
      lnbitsWallet: true,
    },
  });

  const tip = await prisma.tip.findUnique({
    where: {
      id: tipId as string,
    },
  });
  if (!tipGroup || !tip) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  if (
    session.user.id !== tipGroup.tipperId ||
    session.user.id !== tip.tipperId
  ) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  if (!tipGroup.lnbitsWallet) {
    throw new Error("Tip group " + tipGroup.id + " has not lnbits wallet");
  }

  if (tip.status === "UNFUNDED") {
    // ensure we didn't try to prepare the same tip in a short period of time
    // as we could accidentally create two wallets or fund the same tip twice
    // TODO: create a new field name - lastWithdrawal should just be used for withdrawals
    const [lastWithdrawalResult] = await prisma.$transaction(
      [
        prisma.tip.findUniqueOrThrow({
          where: { id: tip.id },
          select: { lastWithdrawal: true },
        }),
        prisma.tip.update({
          where: { id: tip.id },
          data: { lastWithdrawal: new Date() },
        }),
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    if (
      !lastWithdrawalResult.lastWithdrawal ||
      Date.now() - new Date(lastWithdrawalResult.lastWithdrawal).getTime() >
        10000 /* once per 10 seconds */
    ) {
      const existingTipWallet = await prisma.lnbitsWallet.findUnique({
        where: {
          tipId: tip.id,
        },
      });

      const tipLnbitsWalletAdminKey =
        existingTipWallet?.adminKey ||
        (await prepareFundingWallet(tip.id, undefined));

      if ((await getWalletBalance(tipLnbitsWalletAdminKey)) === 0) {
        const { invoice } = await createInvoice(
          tip.amount + tip.fee,
          tipLnbitsWalletAdminKey,
          "Fund tip from group wallet",
          undefined
        );
        const { payInvoiceResponse, payInvoiceResponseBody } = await payInvoice(
          invoice,
          tipGroup.lnbitsWallet.adminKey
        );
        if (!payInvoiceResponse.ok) {
          throw new Error(
            "Failed to pay tip group " +
              tipGroup.id +
              " invoice: " +
              payInvoiceResponse.status +
              " " +
              payInvoiceResponse.statusText +
              " " +
              JSON.stringify(payInvoiceResponseBody)
          );
        }
      } else {
        console.warn(
          "Group tip " + tip.id + " already has a non-zero wallet balance"
        );
      }
      await markTipAsUnclaimed(tip);
    } else {
      console.warn(
        "Group tip " + tip.id + " has unexpected status: " + tip.status
      );
    }
  }

  const updatedTipGroup = await prisma.tipGroup.findUnique({
    where: {
      id: tipGroup.id,
    },
    include: {
      tips: true,
    },
  });

  if (!updatedTipGroup) {
    throw new Error("Failed to retrieve updated tip group: " + tipGroup.id);
  }

  return res.json(updatedTipGroup);
}
