import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import { deleteOldLnbitsWallet } from "lib/deleteOldLnbitsWallet";
import { createInvoice } from "lib/lnbits/createInvoice";
import { payInvoice } from "lib/lnbits/payInvoice";
import { prepareFundingWallet } from "lib/prepareFundingWallet";
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

    const tipWithOldLnbitsWallet = await prisma.tip.findUniqueOrThrow({
      where: {
        id: id as string,
      },
      include: {
        lnbitsWallet: true,
      },
    });

    if (tipWithOldLnbitsWallet.lnbitsWallet) {
      await deleteOldLnbitsWallet(tipWithOldLnbitsWallet.lnbitsWallet);
    }

    const newLnbitsWalletAdminKey = await prepareFundingWallet(
      id as string,
      undefined
    );

    const fundingInvoice = await createInvoice(
      tipWithOldLnbitsWallet.amount + tipWithOldLnbitsWallet.fee,
      newLnbitsWalletAdminKey,
      "Replace Tip wallet",
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
    console.error("Failed to replace tip LNbits wallet", error);

    // the replacement failed, so update the tip's Lnbits wallet creation date
    // so that it will still be pending replacement
    const tipLnbitsWalletResponse = await prisma.tip.findUniqueOrThrow({
      where: {
        id: id as string,
      },
      select: {
        lnbitsWallet: true,
      },
    });

    if (tipLnbitsWalletResponse?.lnbitsWallet) {
      await prisma.lnbitsWallet.update({
        where: {
          id: tipLnbitsWalletResponse.lnbitsWallet.id,
        },
        data: {
          created: new Date("0001-01-01"),
        },
      });
    }

    return res.status(500).json((error as Error).message);
  }
}
