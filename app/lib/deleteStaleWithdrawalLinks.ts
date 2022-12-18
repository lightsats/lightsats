import { sub } from "date-fns";
import prisma from "lib/prismadb";

export async function deleteUnusedWithdrawalLinks(
  userId: string | undefined,
  tipId: string | undefined,
  staleOnly: boolean
) {
  if (!userId && !tipId) {
    throw new Error(
      "Delete unusued withdrawal links: either userId or tipId must be provided"
    );
  }

  const staleWithdrawalLinks = await prisma.withdrawalLink.findMany({
    where: {
      userId,
      tipId,
      used: false,
      ...(staleOnly
        ? {
            // check withdrawal links more than a day old
            created: {
              lt: sub(new Date(), {
                days: 1,
              }),
            },
          }
        : {}),
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
