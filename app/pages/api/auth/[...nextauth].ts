import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { User } from "@prisma/client";
import { getAuthKey } from "lib/lnurl/getAuthKey";
import prisma from "lib/prismadb";
import { Routes } from "lib/Routes";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";

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

        const user = await prisma.user.findUnique({
          where: {
            lnurlPublicKey: authKey.key,
          },
        });

        // console.log("USER", user);
        return user;
      },
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
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
        // on new user creation
        token.user = user;
      }
      return token;
    },
  },
  debug: false,
  pages: {
    signIn: Routes.home,
  },
  session: { strategy: "jwt" },
};

const nextAuthFunc = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);
export default nextAuthFunc;
