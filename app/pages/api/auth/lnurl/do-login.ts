import { StatusCodes } from "http-status-codes";
import { getAuthKey } from "lib/lnurl/getAuthKey";
import prisma from "lib/prismadb";
import * as lnurl from "lnurl";
import type { NextApiRequest, NextApiResponse } from "next";
import { LNURLResponse } from "types/LNURLResponse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LNURLResponse>
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
    return res.json({ status: "ERROR", reason: "Invalid signature" });
  }

  // check if this key is already being used (cannot link to a wallet that is linked to another account)
  if (authKey.linkUserId) {
    if (
      await prisma.user.findUnique({
        where: {
          lnurlPublicKey: key as string,
        },
      })
    ) {
      return res.json({
        status: "ERROR",
        reason: "This wallet is already connected to another account",
      });
    }
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
