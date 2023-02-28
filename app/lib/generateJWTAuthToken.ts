import jwt from "jsonwebtoken";
import { LOGIN_LINK_EXPIRATION_DAYS } from "lib/constants";
import { TwoFactorAuthToken } from "types/TwoFactorAuthToken";

export function generateJWTAuthToken(twoFactorAuthToken: TwoFactorAuthToken) {
  if (
    [
      twoFactorAuthToken.phoneNumber,
      twoFactorAuthToken.email,
      twoFactorAuthToken.lnurlPublicKey,
    ].filter((method) => method)?.length !== 1
  ) {
    throw new Error(
      "Only 1 login method can be passed to generateJWTAuthToken"
    );
  }
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("No NEXTAUTH_SECRET set");
  }
  return jwt.sign(twoFactorAuthToken, process.env.NEXTAUTH_SECRET, {
    expiresIn: LOGIN_LINK_EXPIRATION_DAYS + " days",
  });
}
