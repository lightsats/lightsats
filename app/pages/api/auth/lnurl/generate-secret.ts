import { randomBytes } from "crypto";
import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import prisma from "lib/prismadb";
import * as lnurl from "lnurl";
import type { NextApiRequest, NextApiResponse } from "next";
import { LnurlAuthLoginInfo } from "types/LnurlAuthLoginInfo";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LnurlAuthLoginInfo>
) {
  if (!req.headers.host) {
    throw new Error("No host in request headers");
  }

  const { linkExistingAccount, isPreview } = req.query;

  let linkUserId: string | undefined;

  if (linkExistingAccount === "true") {
    const session = await getLightsatsServerSession(req, res);
    if (!session) {
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
    linkUserId = session.user.id;
  }

  const k1 = generateSecret();

  if (isPreview !== "true") {
    // store the random secret in the DB so it can only be used once
    await prisma.lnurlAuthKey.create({
      data: {
        k1,
        linkUserId: linkUserId || null,
      },
    });
  }

  const params = new URLSearchParams({
    k1,
    tag: "login",
  });

  const callbackUrl = `${
    process.env.APP_URL
  }/api/auth/lnurl/do-login?${params.toString()}`;

  const encoded = lnurl.encode(callbackUrl).toUpperCase();

  res.json({
    lnurl_auth: encoded,
    k1,
  });
}

const generateSecret = function () {
  const numBytes = 32;
  const encoding = "hex";
  return randomBytes(numBytes).toString(encoding);
};
