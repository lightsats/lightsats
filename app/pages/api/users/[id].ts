import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { UpdateUserRequest } from "types/UpdateUserRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | never>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    // TODO: add http status codes
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }

  const { id } = req.query;
  const user = await prisma.user.findUnique({
    where: {
      id: id as string,
    },
  });
  if (!user) {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }
  if (session.user.id !== user.id) {
    res.status(StatusCodes.FORBIDDEN).end();
  }

  switch (req.method) {
    case "PUT":
      return updateUser(user, req, res);
    case "GET":
      return getUser(user, req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}
async function updateUser(
  user: User,
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const updateUserRequest: UpdateUserRequest = req.body;

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      name: updateUserRequest.name ?? null,
      twitterUsername: updateUserRequest.twitterUsername ?? null,
      avatarURL: updateUserRequest.avatarURL ?? null,
    },
  });

  res.status(StatusCodes.NO_CONTENT).end();
}
async function getUser(
  user: User,
  req: NextApiRequest,
  res: NextApiResponse<User>
) {
  res.status(StatusCodes.OK).json(user);
}
