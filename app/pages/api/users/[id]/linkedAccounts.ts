import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { DeleteLinkedAccountRequest } from "types/DeleteLinkedAccountRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  if (req.method !== "DELETE") {
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

  const deleteLinkedAccountRequest = req.body as DeleteLinkedAccountRequest;

  const updatedUser = await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      [deleteLinkedAccountRequest.accountType]: null,
    },
  });

  // if the user can no longer access their account, anonymize their profile
  if (
    !updatedUser.phoneNumber &&
    !updatedUser.email &&
    !updatedUser.lnurlPublicKey
  ) {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        isAnonymous: true,
      },
    });
  }

  return res.status(StatusCodes.NO_CONTENT).end();
}
