import { Tip, TipGroupStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import {
  MAX_TIP_GROUP_QUANTITY,
  MAX_TIP_PASSPHRASE_LENGTH,
  MIN_TIP_PASSPHRASE_LENGTH,
  refundableTipStatuses,
} from "lib/constants";
import { createAchievement } from "lib/createAchievement";
import { prepareFundingWallet } from "lib/prepareFundingWallet";
import prisma from "lib/prismadb";
import { recreateTipFundingInvoice } from "lib/recreateTipFundingInvoice";
import { recreateTipGroupFundingInvoice } from "lib/recreateTipGroupFundingInvoice";
import { calculateFee, generatePassphrase } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { getTemplatedGroupTipProperties } from "pages/api/tipGroups/[id]/tips";
import { TipGroupWithTips } from "types/TipGroupWithTips";
import { CreateTipRequest } from "types/TipRequest";
import { TipWithGroup } from "types/TipWithGroup";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip | Tip[] | TipGroupWithTips | TipWithGroup[]>
) {
  const { apiKey } = req.query;
  const validApiKey = !!(process.env.API_KEY && apiKey === process.env.API_KEY);

  const session = await getLightsatsServerSession(req, res);

  switch (req.method) {
    case "POST":
      if (!session) {
        return res.status(StatusCodes.UNAUTHORIZED).end();
      }
      return handlePostTip(session, req, res);
    case "GET":
      if (!session && !validApiKey) {
        return res.status(StatusCodes.UNAUTHORIZED).end();
      }
      return getTips(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function getTips(
  session: Session | undefined,
  req: NextApiRequest,
  res: NextApiResponse<Tip[] | TipWithGroup[]>
) {
  const { withGroups, expired, reclaimable } = req.query;

  const tips = await prisma.tip.findMany({
    where: {
      ...(session
        ? {
            tipperId: {
              equals: session.user.id,
            },
          }
        : {}),
      ...(reclaimable && expired
        ? {
            status: {
              in: refundableTipStatuses,
            },
            expiry: {
              lt: new Date(),
            },
            type: {
              equals: "CUSTODIAL",
            },
          }
        : {}),
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

  return res.json(tips);
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
    status:
      createTipRequest.type === "NON_CUSTODIAL_NWC" ? "UNSEEN" : "UNFUNDED",
    expiry,
    currency: createTipRequest.currency,
    onboardingFlow: createTipRequest.onboardingFlow,
    note: createTipRequest.note || null,
    tippeeName: createTipRequest.tippeeName,
    tippeeLocale: createTipRequest.tippeeLocale,
    recommendedWalletId: createTipRequest.recommendedWalletId,
    version: 1 /* 0=all tips in same bucket, 1=one wallet per tip */,
    anonymousTipper: createTipRequest.anonymousTipper,
    claimWebhookUrl: createTipRequest.claimWebhookUrl,
    withdrawWebhookUrl: createTipRequest.withdrawWebhookUrl,
    advertisementUrl: createTipRequest.advertisementUrl,
    advertisementImageUrl: createTipRequest.advertisementImageUrl,
    type: createTipRequest.type,
  };

  const generatePassphraseFromRequest = (): string | undefined => {
    if (!createTipRequest.generatePassphrase) {
      return undefined;
    }
    if (
      isNaN(createTipRequest.passphraseLength) ||
      createTipRequest.passphraseLength < MIN_TIP_PASSPHRASE_LENGTH ||
      createTipRequest.passphraseLength > MAX_TIP_PASSPHRASE_LENGTH
    ) {
      throw new Error("Invalid tip passphrase length");
    }

    return generatePassphrase(createTipRequest.passphraseLength);
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
              ...getTemplatedGroupTipProperties(createTipRequest, index),
              passphrase: generatePassphraseFromRequest(),
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

    await createAchievement(session.user.id, "BULK_TIP_CREATED");
    res.json(tipGroup);
  } else {
    let tip = await prisma.tip.create({
      data: { ...createTipData, passphrase: generatePassphraseFromRequest() },
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
