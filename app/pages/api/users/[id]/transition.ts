import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { TransitionUserRequest } from "types/TransitionUserRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  if (req.method !== "POST") {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  const session = await getLightsatsServerSession(req, res);

  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  const { id } = req.query;
  if (session.user.id !== id) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  const transitionUserRequest = req.body as TransitionUserRequest;
  if (
    transitionUserRequest.to !== "tippee" &&
    transitionUserRequest.to !== "tipper"
  ) {
    return res.status(StatusCodes.BAD_REQUEST).end();
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      userType: transitionUserRequest.to,
      ...(transitionUserRequest.to === "tipper"
        ? {
            inJourney: false,
          }
        : {}),
    },
  });
  return res.status(StatusCodes.NO_CONTENT).end();
}
