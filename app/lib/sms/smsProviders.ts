import { smsForSatsAccountProvider } from "lib/sms/SmsForSatsAccountProvider";
import { twilioProvider } from "lib/sms/TwilioProvider";
import { SMSProvider } from "types/SMSProvider";

export const smsProviders: SMSProvider[] = [
  smsForSatsAccountProvider,
  twilioProvider,
].filter((provider) => provider.isAvailable);

console.log(
  `Found ${smsProviders.length} sms providers: ${smsProviders
    .map((provider) => provider.name)
    .join(", ")}`
);
