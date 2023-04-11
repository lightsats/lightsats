import prisma from "lib/prismadb";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export async function getLightsatsServerSession<T>(
  req: NextApiRequest,
  res: NextApiResponse<T>
): Promise<Session | undefined> {
  let session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    const auth = req.headers.authorization;
    if (auth) {
      const apiKey = await prisma.userAPIKey.findUnique({
        where: {
          id: auth.split(" ")[1],
        },
        include: {
          user: true,
        },
      });
      if (apiKey) {
        session = {
          expires: "never",
          user: apiKey.user,
        };
      }
    }
  }

  return session ?? undefined;
}
