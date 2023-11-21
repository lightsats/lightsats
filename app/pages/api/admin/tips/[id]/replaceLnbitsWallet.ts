import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import { deleteLnbitsUser } from "lib/lnbits/deleteLnbitsUser";
import { payInvoice } from "lib/lnbits/payInvoice";
import { prepareFundingWallet } from "lib/prepareFundingWallet";
import prisma from "lib/prismadb";
import { recreateTipFundingInvoice } from "lib/recreateTipFundingInvoice";
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
  try {
    const migrationDateString = process.env.NEXT_PUBLIC_LNBITS_MIGRATION_DATE;
    if (!migrationDateString) {
      throw new Error("No NEXT_PUBLIC_LNBITS_MIGRATION_DATE set");
    }

    const { id } = req.query;
    const tipWithOldLnbitsWallet = await prisma.tip.findUniqueOrThrow({
      where: {
        id: id as string,
      },
      include: {
        lnbitsWallet: true,
      },
    });

    if (
      tipWithOldLnbitsWallet.lnbitsWallet &&
      process.env.LNBITS_MIGRATION_SKIP_OLD_WALLETS !== "true"
    ) {
      try {
        await deleteLnbitsUser(
          tipWithOldLnbitsWallet.lnbitsWallet.lnbitsUserId
        );
      } catch (error) {
        console.warn("Failed to delete LNbits user", error);
      }
      await prisma.lnbitsWallet.delete({
        where: {
          id: tipWithOldLnbitsWallet.lnbitsWallet.id,
        },
      });
    }

    const newLnbitsWalletAdminKey = await prepareFundingWallet(
      id as string,
      undefined
    );

    const tipWithNewFundingInvoice = await recreateTipFundingInvoice(
      tipWithOldLnbitsWallet,
      newLnbitsWalletAdminKey
    );

    if (!tipWithNewFundingInvoice.invoice) {
      throw new Error(
        "No funding invoice on tip " + tipWithNewFundingInvoice.id
      );
    }

    if (!process.env.LNBITS_API_KEY) {
      throw new Error("No LNBITS_API_KEY provided");
    }

    const { payInvoiceResponse, payInvoiceResponseBody } = await payInvoice(
      tipWithNewFundingInvoice.invoice,
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
    return res.status(500).json((error as Error).message);
  }
}
