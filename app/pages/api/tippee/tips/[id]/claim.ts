import { Tip } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import { createAchievement } from "lib/createAchievement";
import { createNotification } from "lib/createNotification";
import { sendEmail } from "lib/email/sendEmail";
import prisma from "lib/prismadb";
import { stageTip } from "lib/stageTip";
import { getClaimWebhookContent, getTipUrl, hasTipExpired } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { ClaimTipRequest } from "types/ClaimTipRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip | Tip[]>
) {
  const session = await getLightsatsServerSession(req, res);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  switch (req.method) {
    case "POST":
      return handleClaimTip(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleClaimTip(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  const { id } = req.query;
  const claimTipRequest = req.body as ClaimTipRequest;
  const tip = await prisma.tip.findUnique({
    where: {
      id: id as string,
    },
    include: {
      lnbitsWallet: true,
      tipper: true,
      group: {
        include: {
          tips: true,
        },
      },
    },
  });
  if (!tip) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  const hasExpired = hasTipExpired(tip);

  if (
    tip.tippeeId ||
    session.user.id === tip.tipperId ||
    tip.status !== "SEEN" ||
    hasExpired ||
    // only allow same user to claim at most one tip from group
    // TODO: add a separate option for this
    (tip.group?.enableStaticLink &&
      tip.group.tips.some((tip) => tip.tippeeId === session.user.id))
  ) {
    // already claimed or trying to claim their own tip
    return res.status(StatusCodes.CONFLICT).end();
  }
  if (tip.type === "CUSTODIAL") {
    await stageTip(session.user.id, tip, "tippee");
  }
  await prisma.tip.update({
    where: {
      id: id as string,
    },
    data: {
      status: "CLAIMED",
      claimed: new Date(),
      tippeeId: session.user.id,
      claimedFromPrintedCard: claimTipRequest.isPrinted,
    },
  });
  if (claimTipRequest.isPrinted) {
    await createAchievement(tip.tipperId, "PRINTED_CARD_TIP_CLAIMED");
  }

  const userHasTips = !!(await prisma.tip.findFirst({
    where: {
      tipperId: session.user.id,
    },
  }));
  if (!userHasTips) {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        inJourney: true,
        journeyStep: 1,
        userType: "tippee",
      },
    });
  }
  await createNotification(tip.tipperId, "TIP_CLAIMED", tip.id);
  if (tip.groupId) {
    await createAchievement(tip.tipperId, "BULK_TIP_CLAIMED");
  }
  await createAchievement(session.user.id, "SELF_CLAIMED");
  await createAchievement(tip.tipperId, "TIP_CLAIMED");
  if (tip.tipper.email) {
    try {
      await sendEmail({
        to: tip.tipper.email,
        subject: "Your tip has been claimed!",
        html: `View your recipient's journey: <a href="${getTipUrl(
          tip,
          tip.tipper.locale
        )}">click here</a>`,
        from: `Lightsats <${process.env.EMAIL_FROM}>`,
      });
    } catch (error) {
      console.error(
        "Failed to send claimed notification email. Tip: " + tip.id
      );
    }
  }
  if (tip.claimWebhookUrl) {
    try {
      const result = await fetch(tip.claimWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getClaimWebhookContent(tip.amount)),
      });
      if (!result.ok) {
        throw new Error(result.status + " " + (await result.text()));
      }
    } catch (error) {
      console.error("Failed to post claim webhook for tip " + tip.id, error);
    }
  }
  return res.status(StatusCodes.NO_CONTENT).end();
}
