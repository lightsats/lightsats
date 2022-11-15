import { ReminderType, User } from "@prisma/client";
import { addDays, differenceInHours } from "date-fns";
import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";

type Reminder =
  | ({ userId: string; tipId: string; reminderType: ReminderType } & Pick<
      User,
      "email"
    >)
  | Pick<User, "phoneNumber">;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Reminder[]>
) {
  const { apiKey } = req.query;
  if (!process.env.API_KEY || apiKey !== process.env.API_KEY) {
    throw new Error("invalid API key");
  }

  switch (req.method) {
    case "GET":
      return handleGetReminders(req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
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
          new Date(tip.expiry).getDate() >
            addDays(new Date(tip.claimed), daysDiff).getDate()
        );
      })
      .filter((tip) => {
        // only send reminders that are ready to be sent today
        if (!tip.claimed) {
          return false;
        }
        if (reminderType === "ONE_DAY_AFTER_CLAIM") {
          return differenceInHours(new Date(), tip.claimed) >= 24;
        } else if (reminderType === "ONE_DAY_BEFORE_EXPIRY") {
          return differenceInHours(new Date(), tip.expiry) <= 24;
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
