import { UserType } from "@prisma/client";

export type TransitionUserRequest = {
  to: UserType;
};
