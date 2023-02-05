import { Tip } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { mapTipToPublicTip } from "lib/mapTipToPublicTip";
import prisma from "lib/prismadb";
import { withErrorMessage } from "lib/withErrorMessage";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import requestIp from "request-ip";
import { ErrorResponse } from "types/ErrorResponse";
import { PublicTip } from "types/PublicTip";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip[] | PublicTip[] | ErrorResponse>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  const { publicTip, passphrase } = req.query;

  switch (req.method) {
    case "GET":
      if (passphrase) {
        return getTipsByPassphrase(
          decodeURIComponent(passphrase as string),
          req,
          res
        );
      }
      if (!session) {
        return res.status(StatusCodes.UNAUTHORIZED).end();
      }
      if (publicTip === "true") {
        return getPublicTips(session, req, res);
      }
      return getTips(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

let previousPassphraseRequests: { ip: string | null; timestamp: number }[] = [];
async function getTipsByPassphrase(
  passphrase: string,
  req: NextApiRequest,
  res: NextApiResponse<Tip[] | ErrorResponse>
) {
  const now = Date.now();
  previousPassphraseRequests = previousPassphraseRequests.filter(
    (request) => now - request.timestamp < 60000
  );
  const ip = requestIp.getClientIp(req);
  const requestsPerMinute = previousPassphraseRequests.length;
  const requestsPerMinuteThisIp = previousPassphraseRequests.filter(
    (req) => req.ip === ip
  ).length;

  console.log(
    "Tip requested by passphrase: " + passphrase,
    " IP " + ip,
    "Requests per minute: " + requestsPerMinute,
    "Requests per minute (this IP): " + requestsPerMinuteThisIp
  );

  if (requestsPerMinute > 60 || requestsPerMinuteThisIp > 5) {
    return withErrorMessage(
      res.status(StatusCodes.TOO_MANY_REQUESTS),
      "Please wait a minute and try again"
    );
  }

  const tip = await prisma.tip.findUnique({
    where: {
      passphrase,
    },
  });
  const tips: Tip[] = [];
  if (tip) {
    tips.push(tip);
  }

  previousPassphraseRequests.push({ ip, timestamp: now });
  return res.json(tips);
}

async function getPublicTips(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<PublicTip[]>
) {
  const tips = await prisma.tip.findMany({
    where: {
      tippeeId: {
        equals: session.user.id,
      },
    },
    include: {
      tipper: true,
      tippee: true,
    },
    orderBy: {
      created: "desc",
    },
  });

  return res.json(tips.map(mapTipToPublicTip));
}

async function getTips(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<Tip[]>
) {
  const tips = await prisma.tip.findMany({
    where: {
      tippeeId: {
        equals: session.user.id,
      },
    },
    orderBy: {
      created: "desc",
    },
  });

  return res.json(tips);
}
