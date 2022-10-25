import { StatusCodes } from "http-status-codes";
import { getAuthKey } from "lib/lnurl/getAuthKey";
import prisma from "lib/prismadb";
import * as lnurl from "lnurl";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { k1, sig, key } = req.query;

  const authKey = await getAuthKey(k1 as string);
  if (!authKey) {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }

  if (
    !lnurl.verifyAuthorizationSignature(
      sig as string,
      k1 as string,
      key as string
    )
  ) {
    res.status(StatusCodes.BAD_REQUEST).end();
    return;
  }
  const lnurlPublicKey = key as string;

  // check if a user exists, if not create one
  const user = await prisma.user.findUnique({
    where: {
      lnurlPublicKey,
    },
  });

  console.log("User " + lnurlPublicKey + " exists: " + !!user);
  if (!user) {
    await prisma.user.create({
      data: {
        lnurlPublicKey,
      },
    });
  }

  await prisma.lnurlAuthKey.update({
    where: {
      k1: authKey.k1,
    },
    data: {
      key: key as string,
    },
  });

  return res.status(200).json({ status: "OK" });
}
