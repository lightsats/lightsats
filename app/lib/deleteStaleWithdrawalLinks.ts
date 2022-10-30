import { sub } from "date-fns";
import { deleteWithdrawLink } from "lib/lnbits/deleteWithdrawLink";
import prisma from "lib/prismadb";

export async function deleteStaleWithdrawalLinks(
  userWalletAdminKey: string,
  userId: string
) {
  //check withdrawal links more than a day old
  const staleWithdrawalLinks = await prisma.withdrawalLink.findMany({
    where: {
      userId,
      used: false,
      created: {
        lt: sub(new Date(), {
          days: 1,
        }),
      },
    },
  });

  if (!staleWithdrawalLinks.length) {
    return;
  }

  console.log(
    "Deleting " +
      staleWithdrawalLinks.length +
      " stale withdrawal links for user " +
      userId
  );
  for (const withdrawalLink of staleWithdrawalLinks) {
    try {
      await deleteWithdrawLink(userWalletAdminKey, withdrawalLink.id);
      await prisma.withdrawalLink.delete({
        where: {
          id: withdrawalLink.id,
        },
      });
    } catch (error) {
      console.error(
        "Failed to delete withdrawal link " + withdrawalLink.id,
        error
      );
    }
  }
}
