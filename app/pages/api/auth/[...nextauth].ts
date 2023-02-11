import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import { getAuthKey } from "lib/lnurl/getAuthKey";
import { PageRoutes } from "lib/PageRoutes";
import prisma from "lib/prismadb";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { TwoFactorAuthToken } from "types/TwoFactorAuthToken";

const adapter = PrismaAdapter(prisma);
export const authOptions: NextAuthOptions = {
  adapter,
  providers: [
    CredentialsProvider({
      id: "lnurl",
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "LNURL auth",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        k1: { type: "text" },
        locale: { type: "text" },
      },
      async authorize(credentials) {
        // console.log("LNURL AUTH", credentials?.k1);
        if (!credentials) {
          return null;
        }

        const authKey = await getAuthKey(credentials.k1);
        // console.log("AUTH KEY", authKey);
        if (!authKey || !authKey.key) {
          return null;
        }
        // auth key has been used already, so delete it
        await prisma.lnurlAuthKey.delete({
          where: {
            k1: authKey.k1,
          },
        });

        let user = await prisma.user.findUnique({
          where: {
            lnurlPublicKey: authKey.key,
          },
        });

        if (!user) {
          if (authKey.linkUserId) {
            user = await prisma.user.findUnique({
              where: {
                id: authKey.linkUserId,
              },
            });
            if (!user) {
              throw new Error(
                "User to link does not exist: " + authKey.linkUserId
              );
            } else {
              await prisma.user.update({
                where: {
                  id: user.id,
                },
                data: {
                  lnurlPublicKey: authKey.key,
                },
              });
            }
          } else {
            user = await prisma.user.create({
              data: {
                lnurlPublicKey: authKey.key,
                locale: credentials.locale,
              },
            });
          }
        }
        return user;
      },
    }),
    CredentialsProvider({
      // Custom 2FA provider which allows users to re-open the same link multiple times, as this is a
      // common issue when using the in-app browser and then accidentally closing it.
      // TODO: also add a user-friendly way to re-generate a new token if the current one is expired
      id: "2fa",
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "2FA",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        token: { type: "text" },
      },
      async authorize(credentials) {
        //console.log("2FA Auth", credentials?.token);
        if (!credentials || !credentials.token) {
          return null;
        }
        if (!process.env.NEXTAUTH_SECRET) {
          throw new Error("No NEXTAUTH_SECRET set");
        }

        try {
          const decoded = jwt.verify(
            credentials.token,
            process.env.NEXTAUTH_SECRET
          ) as TwoFactorAuthToken;
          if (decoded.email) {
            let user = await prisma.user.findUnique({
              where: {
                email: decoded.email,
              },
            });
            if (!user) {
              if (decoded.linkUserId) {
                user = await prisma.user.findUnique({
                  where: {
                    id: decoded.linkUserId,
                  },
                });
                if (!user) {
                  throw new Error(
                    "User to link does not exist: " + decoded.linkUserId
                  );
                } else {
                  await prisma.user.update({
                    where: {
                      id: user.id,
                    },
                    data: {
                      email: decoded.email,
                    },
                  });
                }
              } else {
                user = await prisma.user.create({
                  data: {
                    email: decoded.email,
                    locale: decoded.locale,
                  },
                });
              }
            }
            return user;
          } else if (decoded.phoneNumber) {
            let user = await prisma.user.findUnique({
              where: {
                phoneNumber: decoded.phoneNumber,
              },
            });
            if (!user) {
              user = await prisma.user.create({
                data: {
                  phoneNumber: decoded.phoneNumber,
                  locale: decoded.locale,
                },
              });
            }
            return user;
          } else {
            throw new Error(
              "Unsupported two factor authentication type:" +
                JSON.stringify(decoded)
            );
          }
        } catch (error) {
          console.error("Failed to decode JWT: ", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      // console.log("session.session", session, "session.token", token);
      return Promise.resolve({
        ...session,
        user: token.user as User,
      });
    },
    jwt: async ({ token, user }) => {
      if (user) {
        // on login / new user creation
        token.user = user;
      }
      return token;
    },
  },
  debug: false,
  pages: {
    signIn: PageRoutes.dashboard,
  },
  session: { strategy: "jwt" },
};

const nextAuthFunc = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);
export default nextAuthFunc;
