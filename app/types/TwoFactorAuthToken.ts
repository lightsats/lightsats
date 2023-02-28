export type TwoFactorAuthToken = {
  email?: string;
  phoneNumber?: string;
  lnurlPublicKey?: string;
  callbackUrl: string;
  linkUserId?: string;
  locale?: string;
};
