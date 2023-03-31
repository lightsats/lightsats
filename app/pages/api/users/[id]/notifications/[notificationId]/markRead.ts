import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";

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

  const { notificationId } = req.query;
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId as string,
    },
  });

  if (!notification || notification.userId !== id) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  await prisma.notification.update({
    where: {
      id: notification.id,
    },
    data: {
      read: true,
    },
  });
  return res.status(StatusCodes.NO_CONTENT).end();
}
