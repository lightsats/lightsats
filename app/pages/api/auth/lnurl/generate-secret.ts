import { randomBytes } from "crypto";
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
  const k1 = generateSecret();

  // store the random secret in the DB so it can only be used once
  await prisma.lnurlAuthKey.create({
    data: {
      k1,
    },
  });

  const params = new URLSearchParams({
    k1,
    tag: "login",
  });

  const callbackUrl = `https://${
    req.headers.host
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
