import { StatusCodes } from "http-status-codes";
import { generateEmailTemplate } from "lib/email/generateEmailTemplate";

import { sendEmail } from "lib/email/sendEmail";
import { generateAuthLink } from "lib/generateAuthLink";
import { generateShortLink } from "lib/generateShortLink";
import { getApiI18n } from "lib/i18n/api";
import prisma from "lib/prismadb";

import { sendSms } from "lib/sms/sendSms";
import type { NextApiRequest, NextApiResponse } from "next";
import { TwoFactorLoginRequest } from "types/TwoFactorLoginRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const twoFactorLoginRequest = req.body as TwoFactorLoginRequest;

  const i18n = await getApiI18n(twoFactorLoginRequest.locale);

  const verifyUrl = generateAuthLink(
    twoFactorLoginRequest.email,
    twoFactorLoginRequest.phoneNumber,
    twoFactorLoginRequest.locale,
    twoFactorLoginRequest.callbackUrl
  );

  if (twoFactorLoginRequest.email) {
    try {
      await sendEmail({
        to: twoFactorLoginRequest.email,
        subject: i18n("common:verifyEmailSubject"),
        html: generateEmailTemplate(
          {
            template: "login",
            verifyUrl,
          },
          i18n
        ),
        from: `Lightsats <${process.env.EMAIL_FROM}>`,
      });
      res.status(StatusCodes.NO_CONTENT).end();
    } catch (error) {
      console.error(
        "Failed to send email to " + twoFactorLoginRequest.email,
        error
      );
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
      return;
    }
  } else if (twoFactorLoginRequest.phoneNumber) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          phoneNumber: twoFactorLoginRequest.phoneNumber,
        },
      });
      if (!user) {
        if (twoFactorLoginRequest.tipId) {
          const tip = await prisma.tip.findFirst({
            where: {
              id: twoFactorLoginRequest.tipId,
            },
          });
          if (!tip) {
            res.status(StatusCodes.NOT_FOUND).end();
            return;
          }
          if (tip.numSmsTokens < 1) {
            res.status(StatusCodes.CONFLICT).end();
            return;
          }
          await prisma.tip.update({
            where: {
              id: twoFactorLoginRequest.tipId,
            },
            data: {
              numSmsTokens: tip.numSmsTokens - 1,
            },
          });
        } else {
          // don't allow users to login with phone number unless they have a phone number
          res.status(StatusCodes.NOT_FOUND).end();
          return;
        }
      }

      const smsBody =
        i18n("common:verifyPhoneMessage") +
        " " +
        ((await generateShortLink(verifyUrl)) ?? verifyUrl);

      await sendSms(twoFactorLoginRequest.phoneNumber, smsBody);

      res.status(StatusCodes.NO_CONTENT).end();
    } catch (error) {
      console.error(
        "Failed to send SMS to " + twoFactorLoginRequest.phoneNumber,
        error
      );
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).end();
  }
}
