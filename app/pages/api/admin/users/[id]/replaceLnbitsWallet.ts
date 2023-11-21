import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import { calculateUserWalletBalance } from "lib/calculateUserWalletBalance";
import { createUserStagingLnbitsWallet } from "lib/createUserStagingLnbitsWallet";
import { deleteOldLnbitsWallet } from "lib/deleteOldLnbitsWallet";
import { createInvoice } from "lib/lnbits/createInvoice";
import { payInvoice } from "lib/lnbits/payInvoice";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getLightsatsServerSession(req, res);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  if (!(await isAdmin(session.user.id))) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  switch (req.method) {
    case "POST":
      return handleReplaceLnbitsWallet(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleReplaceLnbitsWallet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  try {
    const migrationDateString = process.env.LNBITS_MIGRATION_DATE;
    if (!migrationDateString) {
      throw new Error("No LNBITS_MIGRATION_DATE set");
    }

    const userWithOldLnbitsWallet = await prisma.user.findUniqueOrThrow({
      where: {
        id: id as string,
      },
      include: {
        lnbitsWallet: true,
        tipsReceived: true,
      },
    });

    if (userWithOldLnbitsWallet.lnbitsWallet) {
      await deleteOldLnbitsWallet(userWithOldLnbitsWallet.lnbitsWallet);
    }

    const newLnbitsWallet = await createUserStagingLnbitsWallet(
      userWithOldLnbitsWallet.id
    );

    const userWalletBalance = calculateUserWalletBalance(
      userWithOldLnbitsWallet
    );

    const fundingInvoice = await createInvoice(
      userWalletBalance,
      newLnbitsWallet.adminKey,
      "Replace User wallet",
      undefined
    );

    if (!process.env.LNBITS_API_KEY) {
      throw new Error("No LNBITS_API_KEY provided");
    }

    const { payInvoiceResponse, payInvoiceResponseBody } = await payInvoice(
      fundingInvoice.invoice,
      process.env.LNBITS_API_KEY
    );

    if (!payInvoiceResponse.ok) {
      throw new Error(
        "Failed to pay funding invoice: " +
          payInvoiceResponse.status +
          " " +
          payInvoiceResponse.statusText +
          " " +
          JSON.stringify(payInvoiceResponseBody)
      );
    }

    return res.status(StatusCodes.NO_CONTENT).end();
  } catch (error) {
    console.error("Failed to replace user LNbits wallet", error);

    // the replacement failed, so update the user's Lnbits wallet creation date
    // so that it will still be pending replacement
    const userLnbitsWalletResponse = await prisma.user.findUniqueOrThrow({
      where: {
        id: id as string,
      },
      select: {
        lnbitsWallet: true,
      },
    });

    if (userLnbitsWalletResponse?.lnbitsWallet) {
      await prisma.lnbitsWallet.update({
        where: {
          id: userLnbitsWalletResponse.lnbitsWallet.id,
        },
        data: {
          created: new Date("0001-01-01"),
        },
      });
    }

    return res.status(500).json((error as Error).message);
  }
}
