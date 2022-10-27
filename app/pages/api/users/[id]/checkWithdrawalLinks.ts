import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { addWithdrawalInvoiceToTips } from "lib/addWithdrawalInvoiceToTips";
import { completeWithdrawal } from "lib/completeWithdrawal";
import { getPayments } from "lib/lnbits/getPayments";
import { getWithdrawLinks } from "lib/lnbits/getWithdrawLinks";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

// used to check if a withdrawal link has been used yet
// (not relying on webhooks because there is no retry mechanism)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  if (req.method !== "GET") {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }

  const { id } = req.query;
  if (session.user.id !== id) {
    res.status(StatusCodes.FORBIDDEN).end();
  }
  await checkWithdrawalLinks(id as string);
  return res.status(StatusCodes.NO_CONTENT).end();
}

export async function checkWithdrawalLinks(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      lnbitsWallet: true,
      withdrawalLinks: {
        where: {
          used: false,
        },
        include: {
          linkTips: {
            include: {
              tip: true,
            },
          },
        },
      },
    },
  });
  if (!user) {
    throw new Error("User " + userId + " does not exist");
  }
  if (!user.lnbitsWallet) {
    throw new Error("User " + userId + " has no staging wallet");
  }

  if (user.withdrawalLinks.length) {
    const lnbitsWithdrawLinks = await getWithdrawLinks(
      user.lnbitsWallet.adminKey
    );

    for (const withdrawalLink of user.withdrawalLinks) {
      if (withdrawalLink.used) {
        throw new Error("expected only unused withdrawal links");
      }
      const matchingLnbitsWithdrawLink = lnbitsWithdrawLinks.find(
        (lnbitsWithdrawLink) => lnbitsWithdrawLink.title === withdrawalLink.memo
      );
      console.log(
        "Checking " +
          withdrawalLink.memo +
          ": " +
          matchingLnbitsWithdrawLink?.used
      );
      if (matchingLnbitsWithdrawLink && matchingLnbitsWithdrawLink.used > 0) {
        // TODO: is there a way to filter the payments e.g. by memo?
        const walletPayments = await getPayments(
          user.lnbitsWallet.adminKey
          // true,
          // matchingLnbitsWithdrawLink.open_time
        );

        const matchingPayment = walletPayments.find(
          (payment) =>
            payment.pending === false && payment.memo === withdrawalLink.memo
        );

        if (matchingPayment) {
          const tips = withdrawalLink.linkTips.map((linkTip) => linkTip.tip);
          await addWithdrawalInvoiceToTips(
            tips,
            matchingPayment.checking_id,
            matchingPayment.bolt11,
            StatusCodes.OK,
            ReasonPhrases.OK,
            null,
            "lnurlw"
          );
          console.log(
            "withdrawalLink " + withdrawalLink.memo + " has been used!",
            "routing fee",
            matchingPayment.fee
          );
          await completeWithdrawal(
            user.lnbitsWallet,
            matchingPayment.fee,
            tips
          );
          await prisma.withdrawalLink.update({
            where: {
              id: withdrawalLink.id,
            },
            data: {
              used: true,
            },
          });
        }
      }
    }
  }
}
