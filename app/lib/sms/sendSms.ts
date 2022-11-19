import { smsProviders } from "lib/sms/smsProviders";

export async function sendSms(to: string, body: string) {
  let success = false;
  for (const smsProvider of smsProviders) {
    success = await smsProvider.sendMessage(to, body);
    if (success) {
      console.log("Sent SMS to " + to + " via " + smsProvider.name);
      break;
    } else {
      console.error(
        "Failed to send SMS to " + to + " provider: " + smsProvider.name
      );
    }
  }
  if (!success) {
    throw new Error(
      "Failed to send SMS to " +
        to +
        ". Tried " +
        smsProviders.length +
        " providers: " +
        smsProviders.map((p) => p.name).join(", ")
    );
  }
}
