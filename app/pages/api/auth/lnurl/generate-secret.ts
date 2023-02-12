import { randomBytes } from "crypto";
import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import * as lnurl from "lnurl";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
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
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
    linkUserId = session.user.id;
  }

  const k1 = generateSecret();

  if (!isPreview) {
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
    encoded,
    k1,
  });
}

const generateSecret = function () {
  const numBytes = 32;
  const encoding = "hex";
  return randomBytes(numBytes).toString(encoding);
};
