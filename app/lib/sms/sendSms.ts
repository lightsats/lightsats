import { SmsType } from "@prisma/client";
import prisma from "lib/prismadb";
import { smsProviders } from "lib/sms/smsProviders";

export async function sendSms(
  to: string,
  body: string,
  smsType: SmsType,
  userId: string | undefined
) {
  let success = false;
  let usedProvider: string | undefined;
  for (const smsProvider of smsProviders) {
    success = await smsProvider.sendMessage(to, body);
    if (success) {
      usedProvider = smsProvider.name;
      console.log("Sent SMS to " + to + " via " + smsProvider.name);
      break;
    } else {
      console.error(
        "Failed to send SMS to " + to + " provider: " + smsProvider.name
      );
    }
  }
  try {
    await prisma.smsLog.create({
      data: {
        to,
        success,
        usedProvider,
        smsType,
        userId,
      },
    });
  } catch (error) {
    console.error("Failed to save SMS log to database", error);
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
