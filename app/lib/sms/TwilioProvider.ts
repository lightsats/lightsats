import twilio from "twilio";
import { SMSProvider } from "types/SMSProvider";

let twilioClient: twilio.Twilio | undefined;

if (
  !process.env.TWILIO_ACCOUNT_SID ||
  !process.env.TWILIO_AUTH_TOKEN ||
  !process.env.TWILIO_PHONE_NUMBER ||
  !process.env.TWILIO_MESSAGING_SERVICE_SID
) {
  console.warn("Twilio SMS config not setup. Please see .env.example");
} else {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

export const twilioProvider: SMSProvider = {
  name: "twilio",
  isAvailable: !!twilioClient && process.env.DISABLE_TWILIO !== "true",
  sendMessage: async (to, body) => {
    if (!twilioClient) {
      throw new Error("Twilio client is undefined");
    }
    try {
      const result = await twilioClient.messages.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER, // TODO: consider Alphanumeric Sender ID ("Lightsats")
        body,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
      });
      console.log(
        twilioProvider.name + ": Send SMS status: " + result.status,
        "error",
        result.errorMessage
      );
      // TODO: poll message status
      return true;
    } catch (error) {
      console.error(twilioProvider.name + ": failed to send SMS", error);
      return false;
    }
  },
};
