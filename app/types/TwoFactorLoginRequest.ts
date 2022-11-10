export type TwoFactorLoginRequest = {
  email?: string;
  phoneNumber?: string;
  callbackUrl: string;
  locale: string;
  tipId?: string; // for new phone number accounts, must be for a valid tip
};
