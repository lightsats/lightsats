import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { TransitionUserRequest } from "types/TransitionUserRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  if (req.method !== "POST") {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }

  const { id } = req.query;
  if (session.user.id !== id) {
    res.status(StatusCodes.FORBIDDEN).end();
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
