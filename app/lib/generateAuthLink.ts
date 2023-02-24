import { generateJWTAuthToken } from "lib/generateJWTAuthToken";
import { PageRoutes } from "lib/PageRoutes";
import { getLocalePath } from "lib/utils";
import { TwoFactorAuthToken } from "types/TwoFactorAuthToken";

export function generateAuthLink(
  email: string | undefined,
  phoneNumber: string | undefined,
  locale: string | undefined,
  callbackUrl: string,
  linkUserId?: string
) {
  const twoFactorAuthToken: TwoFactorAuthToken = {
    email,
    phoneNumber,
    callbackUrl,
    linkUserId,
    locale,
  };
  const token = generateJWTAuthToken(twoFactorAuthToken);

  // TODO: change to appUrl?token=${token} to match breez
  // (would require a redirect from this URL for backward compatibility)
  return `${process.env.APP_URL}${getLocalePath(locale)}${
    PageRoutes.verifySignin
  }/${token}`;
}
