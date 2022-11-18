import { ReminderType, User } from "@prisma/client";
import { addDays, differenceInHours } from "date-fns";
import { StatusCodes } from "http-status-codes";
import { sendEmail } from "lib/email/sendEmail";
import { generateAuthLink } from "lib/generateAuthLink";
import { generateShortLink } from "lib/generateShortLink";
import prisma from "lib/prismadb";
import { sendSms } from "lib/sms/sendSms";
import { getClaimUrl } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

type Reminder = {
  userId: string;
  tipId: string;
  reminderType: ReminderType;
} & Pick<User, "email" | "phoneNumber">;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Reminder[] | never>
) {
  const { apiKey } = req.query;
  if (!process.env.API_KEY || apiKey !== process.env.API_KEY) {
    throw new Error("invalid API key");
  }

  switch (req.method) {
    case "GET":
      return handleGetReminders(req, res);
    case "POST":
      return handlePostReminder(req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}

async function handlePostReminder(
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const reminder = JSON.parse(req.body) as Reminder;

  try {
    await sendReminder(reminder);
    res.status(StatusCodes.NO_CONTENT).end();
  } catch (error) {
    console.error("Failed to send reminder", reminder, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
}

async function handleGetReminders(
  req: NextApiRequest,
  res: NextApiResponse<Reminder[]>
) {
  const reminders: Reminder[] = [];

  for (const reminderType of Object.values(ReminderType)) {
    const tips = (
      await prisma.tip.findMany({
        where: {
          AND: [
            {
              sentReminders: {
                none: {
                  reminderType, // do not send reminders that have already been sent
                },
              },
            },
            {
              status: "CLAIMED", // only send reminders for tips that have been claimed but not withdrawn
            },
            {
              expiry: {
                gt: new Date(), // cannot withdraw expired tips
              },
            },
            {
              tippee: {
                // only remind tips that have been claimed and have a phone number or email
                OR: [
                  {
                    email: {
                      not: null,
                    },
                  },
                  {
                    phoneNumber: {
                      not: null,
                    },
                  },
                ],
              },
            },
            /*{ // TODO: find a way to use a calculated field https://github.com/prisma/prisma/issues/3394
            expiry: {
              gt: reminderType === 'ONE_DAY_AFTER_CLAIM' ? prisma.tip.fields.one_day_after_claim : prisma.tip.fields.one_day_before_expiry
            },
          }*/
          ],
        },
        include: {
          tippee: true,
        },
      })
    )
      .filter((tip) => {
        // only send reminders if there is enough time to send them
        let daysDiff = 0;
        if (reminderType === "ONE_DAY_AFTER_CLAIM") {
          daysDiff = 2; // only send a reminder the day after the claim if it won't conflict with the expiry email
        } else if (reminderType === "ONE_DAY_BEFORE_EXPIRY") {
          daysDiff = 1; // only send a reminder the day before expiry if they claimed at least one day before expiry
        } else {
          throw new Error("Unknown reminder type: " + reminderType);
        }

        return (
          tip.claimed &&
          new Date(tip.expiry).getTime() >
            addDays(new Date(tip.claimed), daysDiff).getTime()
        );
      })
      .filter((tip) => {
        // only send reminders that are ready to be sent today
        if (!tip.claimed) {
          return false;
        }
        if (reminderType === "ONE_DAY_AFTER_CLAIM") {
          return differenceInHours(new Date(), new Date(tip.claimed)) >= 24;
        } else if (reminderType === "ONE_DAY_BEFORE_EXPIRY") {
          return differenceInHours(new Date(tip.expiry), new Date()) <= 24;
        } else {
          throw new Error("Unknown reminder type: " + reminderType);
        }
      });
    for (const tip of tips) {
      if (!tip.tippee) {
        continue;
      }
      const reminder: Reminder = {
        reminderType,
        email: tip.tippee.email,
        phoneNumber: tip.tippee.phoneNumber,
        tipId: tip.id,
        userId: tip.tippee.id,
      };

      reminders.push(reminder);
    }
  }

  res.json(reminders);
}

async function sendReminder(reminder: Reminder) {
  if (!reminder.tipId) {
    throw new Error("Reminder tipId is undefined: " + JSON.stringify(reminder));
  }
  const tip = await prisma.tip.findUnique({
    where: {
      id: reminder.tipId,
    },
  });
  if (!tip) {
    throw new Error("Tip does not exist: " + reminder.tipId);
  }
  const user = await prisma.user.findUnique({
    where: {
      id: reminder.userId,
    },
  });
  if (!user) {
    throw new Error("User does not exist: " + reminder.userId);
  }

  if (process.env.DISABLE_SENT_REMINDERS !== "true") {
    await prisma.sentReminder.create({
      data: {
        reminderType: reminder.reminderType,
        tipId: reminder.tipId,
        userId: reminder.userId,
      },
    });
  }

  const verifyUrl = generateAuthLink(
    reminder.email ?? undefined,
    reminder.phoneNumber ?? undefined,
    tip.tippeeLocale,
    getClaimUrl(tip)
  );
  if (reminder.email) {
    await sendEmail({
      to: reminder.email,
      subject:
        reminder.reminderType === "ONE_DAY_AFTER_CLAIM"
          ? "Reminder: You haven't withdrawn your Lightsats Tip yet!"
          : "Reminder: Your Lightsats Tip is expiring tomorrow!",
      html: `Withdraw your tip before it expires. To continue your journey <a href="${verifyUrl}">click here</a>`,
      from: `Lightsats <${process.env.EMAIL_FROM}>`,
    });
  } else if (reminder.phoneNumber) {
    const shortUrl = (await generateShortLink(verifyUrl)) ?? verifyUrl;

    await sendSms(
      reminder.phoneNumber,
      (reminder.reminderType === "ONE_DAY_AFTER_CLAIM"
        ? "Lightsats Reminder: You haven't withdrawn your tip yet!"
        : "Lightsats Reminder: Your tip is expiring tomorrow!") +
        " " +
        shortUrl
    );
  } else {
    throw new Error(
      "Reminder does not have a valid contact method: " +
        JSON.stringify(reminder)
    );
  }
  if (process.env.DISABLE_SENT_REMINDERS !== "true") {
    await prisma.sentReminder.update({
      where: {
        userId_tipId_reminderType: {
          reminderType: reminder.reminderType,
          tipId: reminder.tipId,
          userId: reminder.userId,
        },
      },
      data: {
        delivered: true,
      },
    });
  }
}
