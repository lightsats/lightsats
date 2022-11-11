import { User } from "@prisma/client";

export type PublicUser = Pick<
  User,
  "id" | "userType" | "name" | "avatarURL" | "twitterUsername" | "created"
> & {
  fallbackAvatarId: string | undefined;
  numTipsSent: number;
  numTipsReceived: number;
  satsDonated: number;
  // scoreboardPosition: number; // TODO: calculate
};
