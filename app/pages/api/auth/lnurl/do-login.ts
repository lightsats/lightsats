import { StatusCodes } from "http-status-codes";
import { generateJWTAuthToken } from "lib/generateJWTAuthToken";
import { getAuthKey } from "lib/lnurl/getAuthKey";
import prisma from "lib/prismadb";
import { getAppUrl } from "lib/utils";
import * as lnurl from "lnurl";
import type { NextApiRequest, NextApiResponse } from "next";
import { LNURLResponse } from "types/LNURLResponse";

type LNURLAuthResponse = LNURLResponse & {
  token?: string; // for breez jwt login https://doc.breez.technology/Adding-a-WebLN-widget-with-LNURL-Auth.html
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LNURLAuthResponse>
) {
  const { k1, sig, key, jwt } = req.query;

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

  const response: LNURLAuthResponse = {
    status: "OK",
  };
  if (jwt === "true") {
    response.token = generateJWTAuthToken({
      lnurlPublicKey: key as string,
      callbackUrl: `${getAppUrl()}/dashboard`,
    });
    // we have a JWT, no need to keep the authkey now.
    // user will use the 2fa auth method with the jwt token.
    await prisma.lnurlAuthKey.delete({
      where: {
        k1: authKey.k1,
      },
    });
  } else {
    await prisma.lnurlAuthKey.update({
      where: {
        k1: authKey.k1,
      },
      data: {
        key: key as string,
      },
    });
  }

  return res.status(200).json(response);
}
