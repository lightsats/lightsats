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
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }

  if (!isAdmin(session.user.id)) {
    res.status(StatusCodes.FORBIDDEN).end();
    return;
  }

  switch (req.method) {
    case "POST":
      return handleFundAccount(req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
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
