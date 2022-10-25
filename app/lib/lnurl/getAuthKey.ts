import { LnurlAuthKey } from "@prisma/client";
import { sub } from "date-fns";
import prisma from "lib/prismadb";

export async function getAuthKey(k1: string): Promise<LnurlAuthKey | null> {
  // delete old auth keys
  await prisma.lnurlAuthKey.deleteMany({
    where: {
      created: {
        lt: sub(new Date(), {
          minutes: 5,
        }),
      },
    },
  });

  const authKey = await prisma.lnurlAuthKey.findUnique({
    where: {
      k1: k1 as string,
    },
  });

  if (!authKey) {
    return null;
  }
  return authKey;
}
