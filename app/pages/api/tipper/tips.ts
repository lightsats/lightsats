import { Tip, TipGroupStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { MAX_TIP_GROUP_QUANTITY } from "lib/constants";
import { createAchievement } from "lib/createAchievement";
import { prepareFundingWallet } from "lib/prepareFundingWallet";
import prisma from "lib/prismadb";
import { recreateTipFundingInvoice } from "lib/recreateTipFundingInvoice";
import { recreateTipGroupFundingInvoice } from "lib/recreateTipGroupFundingInvoice";
import { calculateFee } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { TipGroupWithTips } from "types/TipGroupWithTips";
import { CreateTipRequest } from "types/TipRequest";
import { TipWithGroup } from "types/TipWithGroup";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip | Tip[] | TipGroupWithTips | TipWithGroup[]>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  switch (req.method) {
    case "POST":
      return handlePostTip(session, req, res);
    case "GET":
      return getTips(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function getTips(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<Tip[] | TipWithGroup[]>
) {
  const { withGroups } = req.query;

  const tips = await prisma.tip.findMany({
    where: {
      tipperId: {
        equals: session.user.id,
      },
      ...(withGroups
        ? {
            OR: [
              {
                groupTipIndex: {
                  equals: 1,
                },
              },
              {
                groupTipIndex: {
                  equals: null,
                },
              },
            ],
          }
        : {}),
    },
    orderBy: {
      created: "desc",
    },
    include: withGroups
      ? {
          group: {
            include: {
              tips: true,
            },
          },
        }
      : undefined,
  });

  return res.status(StatusCodes.OK).json(tips);
}

async function handlePostTip(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<Tip | TipGroupWithTips>
) {
  if (!process.env.APP_URL) {
    throw new Error("No APP_URL provided");
  }
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }
  if (!process.env.LNBITS_WEBHOOK_SECRET_KEY) {
    throw new Error("No LNBITS_WEBHOOK_SECRET_KEY provided");
  }
  if (!process.env.LNBITS_USER_ID) {
    throw new Error("No LNBITS_USER_ID provided");
  }

  const createTipRequest = req.body as CreateTipRequest;
  if (
    createTipRequest.amount <= 0 ||
    Math.floor(createTipRequest.amount) !== createTipRequest.amount
  ) {
    throw new Error("Only tips with positive, whole amounts are allowed");
  }
  if (
    createTipRequest.quantity < 1 ||
    createTipRequest.quantity > MAX_TIP_GROUP_QUANTITY ||
    Math.floor(createTipRequest.quantity) !== createTipRequest.quantity
  ) {
    throw new Error("Unsupported tip quantity: " + createTipRequest.quantity);
  }

  const expiry = createTipRequest.expiry;
  const fee = calculateFee(createTipRequest.amount);

  const createTipData: Parameters<typeof prisma.tip.create>[0]["data"] = {
    tipperId: session.user.id,
    amount: createTipRequest.amount,
    fee,
    status: "UNFUNDED",
    expiry,
    currency: createTipRequest.currency,
    skipOnboarding: createTipRequest.skipOnboarding,
    version: 1 /* 0=all tips in same bucket, 1=one wallet per tip */,
  };

  if (createTipRequest.quantity > 1) {
    let tipGroup = await prisma.tipGroup.create({
      data: {
        quantity: createTipRequest.quantity,
        status: TipGroupStatus.UNFUNDED,
        tipperId: session.user.id,
        tips: {
          createMany: {
            data: [...new Array(createTipRequest.quantity)].map((_, index) => ({
              ...createTipData,
              groupTipIndex: index,
            })),
          },
        },
      },
      include: {
        tips: true,
      },
    });

    let lnbitsWalletAdminKey: string;
    try {
      lnbitsWalletAdminKey = await prepareFundingWallet(undefined, tipGroup.id);
    } catch (error) {
      await prisma.tipGroup.delete({
        where: {
          id: tipGroup.id,
        },
      });
      throw error;
    }

    tipGroup = await recreateTipGroupFundingInvoice(
      tipGroup,
      lnbitsWalletAdminKey
    );

    //await createAchievement(session.user.id, "CREATED_TIP_GROUP");
    res.json(tipGroup);
  } else {
    let tip = await prisma.tip.create({
      data: createTipData,
    });

    let lnbitsWalletAdminKey: string;
    try {
      lnbitsWalletAdminKey = await prepareFundingWallet(tip.id, undefined);
    } catch (error) {
      await prisma.tip.delete({
        where: {
          id: tip.id,
        },
      });
      throw error;
    }

    tip = await recreateTipFundingInvoice(tip, lnbitsWalletAdminKey);

    await createAchievement(session.user.id, "CREATED_TIP");
    res.json(tip);
  }
}
