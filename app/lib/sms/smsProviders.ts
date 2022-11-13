import { smsForSatsProvider } from "lib/sms/SmsForSatsProvider";
import { twilioProvider } from "lib/sms/TwilioProvider";
import { SMSProvider } from "types/SMSProvider";

export const smsProviders: SMSProvider[] = [
  smsForSatsProvider,
  twilioProvider,
].filter((provider) => provider.isAvailable);
