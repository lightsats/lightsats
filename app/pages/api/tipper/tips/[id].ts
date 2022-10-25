import { Tip, TipStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getInvoiceStatus } from "lib/lnbits";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    // TODO: add http status codes
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }

  const { id } = req.query;
  const tip = await prisma.tip.findUnique({
    where: {
      id: id as string,
    },
  });
  if (!tip) {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }
  if (session.user.id !== tip.tipperId) {
    res.status(StatusCodes.FORBIDDEN).end();
  }

  switch (req.method) {
    case "DELETE":
      return deleteTip(tip, req, res);
    case "GET":
      return getTip(tip, req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}
async function deleteTip(
  tip: Tip,
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }

  if (tip.status === TipStatus.UNFUNDED) {
    const lnbitsWallet = await prisma.lnbitsWallet.findUnique({
      where: {
        tipId: tip.id,
      },
    });
    if (lnbitsWallet) {
      const deleteWalletRequestHeaders = new Headers();
      deleteWalletRequestHeaders.append(
        "X-Api-Key",
        process.env.LNBITS_API_KEY
      );

      const deleteLnbitsUserResponse = await fetch(
        `${process.env.LNBITS_URL}/usermanager/api/v1/users/${lnbitsWallet.lnbitsUserId}`,
        {
          method: "DELETE",
          headers: deleteWalletRequestHeaders,
        }
      );
      console.log(
        "Tip",
        tip.id,
        "Delete tip lnbits user + wallet response: ",
        deleteLnbitsUserResponse.status,
        deleteLnbitsUserResponse.statusText
      );
    } else {
      console.warn("No lnbits user+wallet for tip " + tip.id);
    }

    await prisma.tip.delete({
      where: {
        id: tip.id,
      },
    });
  }

  res.status(StatusCodes.NO_CONTENT).end();
}
async function getTip(
  tip: Tip,
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  if (tip.status === 'UNFUNDED') {
    const wallet = await prisma.lnbitsWallet.findUnique({
      where: {
        tipId: tip.id
      }
    });
    if (wallet && tip.invoiceId) {
      const invoiceStatus = await getInvoiceStatus(wallet.adminKey, tip.invoiceId);
      if (invoiceStatus.paid) {
        await prisma.tip.update({
          data: {
            status: "UNCLAIMED",
          },
          where: {
            id: tip.id,
          },
        });
        // console.log("Tip has been funded: ", tip.id);
      }
    }
  }


  res.status(StatusCodes.OK).json(tip);
}