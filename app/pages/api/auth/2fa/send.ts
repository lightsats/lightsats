import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { LOGIN_LINK_EXPIRATION_DAYS } from "lib/constants";
import { sendEmail } from "lib/email/sendEmail";
import { generateShortLink } from "lib/generateShortLink";
import { getApiI18n } from "lib/i18n/api";
import prisma from "lib/prismadb";
import { Routes } from "lib/Routes";
import { sendSms } from "lib/sms/sendSms";
import { getLocalePath } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

import { TwoFactorAuthToken } from "types/TwoFactorAuthToken";
import { TwoFactorLoginRequest } from "types/TwoFactorLoginRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("No NEXTAUTH_SECRET set");
  }
  const twoFactorLoginRequest = req.body as TwoFactorLoginRequest;

  const i18n = await getApiI18n(twoFactorLoginRequest.locale);
  const twoFactorAuthToken: TwoFactorAuthToken = {
    email: twoFactorLoginRequest.email,
    phoneNumber: twoFactorLoginRequest.phoneNumber,
    callbackUrl: twoFactorLoginRequest.callbackUrl,
  };
  const token = jwt.sign(twoFactorAuthToken, process.env.NEXTAUTH_SECRET, {
    expiresIn: LOGIN_LINK_EXPIRATION_DAYS + " days",
  });

  const verifyUrl = `${process.env.APP_URL}${getLocalePath(
    twoFactorLoginRequest.locale
  )}${Routes.verifySignin}/${token}`;

  if (twoFactorLoginRequest.email) {
    try {
      await sendEmail({
        to: twoFactorLoginRequest.email,
        subject: i18n("common:verifyEmailSubject"),
        html: i18n("common:verifyEmailMessage", {
          verifyUrl,
        }) as string,
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
