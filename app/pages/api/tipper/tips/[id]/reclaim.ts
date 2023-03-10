import { StatusCodes } from "http-status-codes";
import { refundableTipStatuses } from "lib/constants";
import { sendEmail } from "lib/email/sendEmail";
import prisma from "lib/prismadb";
import { reclaimTip } from "lib/reclaimTip";
import { getAppUrl, getTipUrl } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  const { apiKey } = req.query;
  const validApiKey = !!(process.env.API_KEY && apiKey === process.env.API_KEY);

  if (!session && !validApiKey) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  switch (req.method) {
    case "POST":
      return handleReclaimTip(session, validApiKey, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleReclaimTip(
  session: Session | null,
  validApiKey: boolean,
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const { id } = req.query;
  const tip = await prisma.tip.findUnique({
    where: {
      id: id as string,
    },
    include: {
      lnbitsWallet: true,
      tipper: true,
    },
  });
  if (!tip) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  if (!validApiKey && (!session || session.user.id !== tip.tipperId)) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }
  if (refundableTipStatuses.indexOf(tip.status) < 0) {
    return res.status(StatusCodes.CONFLICT).end();
  }

  await reclaimTip(tip);
  if (validApiKey && tip.tipper.email && !tip.groupTipIndex) {
    try {
      await sendEmail({
        to: tip.tipper.email,
        subject: "Lightsats Tip Reclaimed",
        html: `Your tip wasn't withdrawn in time and has been automatically reclaimed. See your tip: <a href="${getTipUrl(
          tip,
          tip.tipper.locale
        )}">click here</a><br/><br/>${
          tip.tipper.lightningAddress
            ? `Your sats will be automatically refunded to ${tip.tipper.lightningAddress}.`
            : `Set a lightning address in your <a href="${getAppUrl()}/profile">Lightsats profile</a> to receive automatic refunds.`
        }`,
        from: `Lightsats <${process.env.EMAIL_FROM}>`,
      });
    } catch (error) {
      console.error("Failed to send tip reclaim email");
    }
  }

  return res.status(StatusCodes.NO_CONTENT).end();
}
