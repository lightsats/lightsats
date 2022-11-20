export type TwoFactorAuthToken = {
  email?: string;
  phoneNumber?: string;
  callbackUrl: string;
  linkUserId?: string;
};
