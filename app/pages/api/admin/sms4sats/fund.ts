import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { fundSmsForSatsAccountBalance } from "lib/sms/SmsForSatsAccountProvider";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  if (!isAdmin(session.user.id)) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  switch (req.method) {
    case "POST":
      return handleFundAccount(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleFundAccount(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const { amount } = req.body;
  if (isNaN(amount)) {
    throw new Error("Invalid amount");
  }
  const invoice = await fundSmsForSatsAccountBalance(amount);
  res.json(invoice);
}
