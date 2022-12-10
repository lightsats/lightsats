import { StatusCodes } from "http-status-codes";
import { bitcoinJourneyPages } from "lib/PageRoutes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { UpdateUserJourneyRequest } from "types/UpdateUserJourneyRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  if (req.method !== "PUT") {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  const { id } = req.query;
  if (session.user.id !== id) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  const journey = req.body as UpdateUserJourneyRequest;
  if (
    !journey.journeyStep ||
    journey.journeyStep < 1 ||
    journey.journeyStep > bitcoinJourneyPages.length
  ) {
    return res.status(StatusCodes.BAD_REQUEST).end();
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      inJourney: journey.journeyStep < bitcoinJourneyPages.length,
      journeyStep: journey.journeyStep,
    },
  });
  return res.status(StatusCodes.NO_CONTENT).end();
}
