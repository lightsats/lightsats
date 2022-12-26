import { getAuthKey } from "lib/lnurl/getAuthKey";
import type { NextApiRequest, NextApiResponse } from "next";
import { LnurlAuthStatus } from "types/LnurlAuthStatus";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LnurlAuthStatus>
) {
  const { k1 } = req.query;
  const authKey = await getAuthKey(k1 as string);

  res.json({ verified: !!authKey?.key, used: !authKey });
}
