import { Prisma, TipStatus } from "@prisma/client";
import * as bolt11 from "bolt11";
import { StatusCodes } from "http-status-codes";
import { createInvoice, getWalletBalance, payInvoice } from "lib/lnbits";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { WithdrawalRequest } from "types/WithdrawalRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    // TODO: add http status codes
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }

  switch (req.method) {
    case "POST":
      return handleWithdrawal(session, req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}

async function handleWithdrawal(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }

  // TODO: confirm this with a lightning expert
  const withdrawalRequest = req.body as WithdrawalRequest;
  if (
    withdrawalRequest.flow !== "tippee" &&
    withdrawalRequest.flow !== "tipper"
  ) {
    throw new Error("Unsupported withdrawal flow: " + withdrawalRequest.flow);
  }

  const withdrawalInvoicePriceInSats =
    parseInt(bolt11.decode(withdrawalRequest.invoice).millisatoshis || "0") /
    1000;

  const initialStatus: TipStatus =
    withdrawalRequest.flow === "tippee" ? "CLAIMED" : "RECLAIMED";

  // TODO: consider running the below code in a transaction
  const whereQuery: Prisma.TipWhereInput = {
    status: {
      equals: initialStatus,
    },
    ...(withdrawalRequest.flow === "tippee"
      ? {
          tippeeId: {
            equals: session.user.id,
          },
          expiry: {
            gt: new Date(), // cannot withdraw expired tips
          },
        }
      : {
          tipperId: {
            equals: session.user.id,
          },
        }),
  };
  const tips = await prisma.tip.findMany({
    where: whereQuery,
  });

  if (!tips.length) {
    // no tips to claim
    res.status(StatusCodes.CONFLICT).end();
    return;
  }

  const amount = tips.map((tip) => tip.amount).reduce((a, b) => a + b);
  const fees = tips.map((tip) => tip.fee).reduce((a, b) => a + b);

  if (withdrawalInvoicePriceInSats !== amount) {
    res.status(StatusCodes.CONFLICT).end();
    return;
  }

  const userWallet = await prisma.lnbitsWallet.findUnique({
    where: {
      userId: session.user.id,
    },
  });
  if (!userWallet) {
    throw new Error("User " + session.user.id + " has no staging wallet");
  }

  // await prisma.tip.updateMany({
  //   where: whereQuery,
  //   data: {
  //     status: "WITHDRAWING",
  //     withdrawalFlow: withdrawalRequest.flow,
  //   },
  // });

  // curl -X POST https://legend.lnbits.com/api/v1/payments -d '{"out": true, "bolt11": <string>}' -H "X-Api-Key: 76c2153437ea421b8f2a0067e786d340" -H "Content-type: application/json"

  const { payInvoiceResponse, payInvoiceResponseBody } = await payInvoice(
    withdrawalRequest.invoice,
    userWallet.adminKey
  );

  if (payInvoiceResponseBody) {
    await prisma.tip.updateMany({
      where: whereQuery,
      data: {
        withdrawalInvoiceId: payInvoiceResponseBody.checking_id,
        withdrawalInvoice: withdrawalRequest.invoice,
        payInvoiceStatus: payInvoiceResponse.status,
        payInvoiceStatusText: payInvoiceResponse.statusText,
        payInvoiceErrorBody:
          !payInvoiceResponse.ok && payInvoiceResponseBody
            ? JSON.stringify(payInvoiceResponseBody)
            : null,
      },
    });
  }

  if (!payInvoiceResponse.ok) {
    // revert to initial status so the user can retry
    console.error(
      "Failed to withdraw funds for user " +
        session.user.id +
        ": " +
        payInvoiceResponse.status,
      payInvoiceResponseBody
    );

    res.status(StatusCodes.BAD_GATEWAY).json({
      status: payInvoiceResponse.status,
      statusText: payInvoiceResponse.statusText,
      body: payInvoiceResponseBody,
    });
  } else {
    await prisma.tip.updateMany({
      where: whereQuery,
      data: {
        status: withdrawalRequest.flow === "tippee" ? "WITHDRAWN" : "REFUNDED",
      },
    });

    try {
      const remainingWalletBalance = await getWalletBalance(
        userWallet.adminKey
      );
      console.log(
        `User has a remaining balance of ${remainingWalletBalance}/${fees} fees`
      );
      if (remainingWalletBalance > 0) {
        const { invoice } = await createInvoice(
          remainingWalletBalance,
          process.env.LNBITS_API_KEY,
          "withdraw unspent fees",
          undefined
        );
        await payInvoice(invoice, userWallet.adminKey);
      }
    } catch (error) {
      console.error(
        "Failed to withdraw remaining balance from user " +
          session.user.id +
          " staging wallet",
        error
      );
    }

    res.status(204).end();
  }
}
