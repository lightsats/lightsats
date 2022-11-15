import { smsForSatsImmediateProvider } from "lib/sms/SmsForSatsImmediateProvider";
import { smsForSatsProvider } from "lib/sms/SmsForSatsProvider";
import { twilioProvider } from "lib/sms/TwilioProvider";
import { SMSProvider } from "types/SMSProvider";

export const smsProviders: SMSProvider[] = [
  smsForSatsImmediateProvider,
  smsForSatsProvider,
  twilioProvider,
].filter((provider) => provider.isAvailable);

console.log(
  `Found ${smsProviders.length} sms providers: ${smsProviders
    .map((provider) => provider.name)
    .join(", ")}`
);
