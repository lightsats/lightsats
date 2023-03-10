import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User[]>
) {
  const { apiKey } = req.query;
  const validApiKey = !!(process.env.API_KEY && apiKey === process.env.API_KEY);
  if (!validApiKey) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  switch (req.method) {
    case "GET":
      return getUsers(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function getUsers(req: NextApiRequest, res: NextApiResponse<User[]>) {
  const { refundable, hasLightningAddress } = req.query;

  const users = await prisma.user.findMany({
    where: {
      ...(refundable
        ? {
            tipsSent: {
              some: {
                status: {
                  equals: "RECLAIMED",
                },
              },
            },
          }
        : {}),
      ...(hasLightningAddress
        ? {
            lightningAddress: {
              not: null,
            },
          }
        : {}),
    },
  });

  return res.json(users);
}
