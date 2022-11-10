export type TwoFactorLoginRequest = {
  email?: string;
  phoneNumber?: string;
  callbackUrl: string;
  locale: string;
};
