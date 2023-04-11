import { UserAPIKey } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserAPIKey[] | UserAPIKey>
) {
  const session = await getLightsatsServerSession(req, res);

  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  const { id } = req.query;
  if (session.user.id !== id) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  if (req.method === "GET") {
    return getApiKeys(session, req, res);
  }
  if (req.method === "POST") {
    return createApiKey(session, req, res);
  }
  return res.status(StatusCodes.NOT_FOUND).end();
}
async function getApiKeys(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<UserAPIKey[]>
) {
  const apiKeys = await prisma.userAPIKey.findMany({
    where: {
      userId: session.user.id,
    },
  });
  return res.json(apiKeys);
}

async function createApiKey(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<UserAPIKey>
) {
  const key = Buffer.from(uuidv4()).toString("base64");

  const apiKeys = await prisma.userAPIKey.create({
    data: {
      id: key,
      userId: session.user.id,
    },
  });
  return res.json(apiKeys);
}
