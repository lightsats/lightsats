import jwt from "jsonwebtoken";
import { LOGIN_LINK_EXPIRATION_DAYS } from "lib/constants";
import { Routes } from "lib/Routes";
import { getLocalePath } from "lib/utils";
import { TwoFactorAuthToken } from "types/TwoFactorAuthToken";

export function generateAuthLink(
  email: string | undefined,
  phoneNumber: string | undefined,
  locale: string,
  callbackUrl: string,
  linkUserId?: string
) {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("No NEXTAUTH_SECRET set");
  }

  const twoFactorAuthToken: TwoFactorAuthToken = {
    email,
    phoneNumber,
    callbackUrl,
    linkUserId,
    locale,
  };
  const token = jwt.sign(twoFactorAuthToken, process.env.NEXTAUTH_SECRET, {
    expiresIn: LOGIN_LINK_EXPIRATION_DAYS + " days",
  });

  return `${process.env.APP_URL}${getLocalePath(locale)}${
    Routes.verifySignin
  }/${token}`;
}
