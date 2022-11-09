import { User } from "@prisma/client";

export type PublicUser = Pick<
  User,
  "userType" | "name" | "avatarURL" | "twitterUsername" | "created"
> & {
  fallbackAvatarId: string | undefined;
  numTipsSent: number;
  numTipsReceived: number;
  satsDonated: number;
};
