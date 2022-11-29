import { User } from "@prisma/client";

export type DeleteLinkedAccountRequest = {
  accountType: keyof Pick<User, "phoneNumber" | "email" | "lnurlPublicKey">;
};
