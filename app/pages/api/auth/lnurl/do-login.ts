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
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  if (
    !lnurl.verifyAuthorizationSignature(
      sig as string,
      k1 as string,
      key as string
    )
  ) {
    return res.status(StatusCodes.BAD_REQUEST).end();
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
