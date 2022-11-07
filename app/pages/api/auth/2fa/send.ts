import { StatusCodes } from "http-status-codes";
import { Routes } from "lib/Routes";
import type { NextApiRequest, NextApiResponse } from "next";
// import i18nconfig from "next-i18next.config";
import jwt from "jsonwebtoken";
import { getApiI18n } from "lib/i18n/api";
import { getLocalePath } from "lib/utils";
import * as nodemailer from "nodemailer";
import { TwoFactorAuthToken } from "types/TwoFactorAuthToken";
import { TwoFactorLoginRequest } from "types/TwoFactorLoginRequest";

if (
  !process.env.EMAIL_SERVER_USER ||
  !process.env.EMAIL_SERVER_PASSWORD ||
  !process.env.EMAIL_SERVER_HOST ||
  !process.env.EMAIL_SERVER_PORT ||
  !process.env.EMAIL_FROM
) {
  throw new Error("Email config not setup. Please see .env.example");
}

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT),
  // secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

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
  };
  const token = jwt.sign(twoFactorAuthToken, process.env.NEXTAUTH_SECRET, {
    expiresIn: "30 days",
  });

  const verifyUrl = `${process.env.APP_URL}${getLocalePath(
    twoFactorLoginRequest.locale
  )}${Routes.verifySignin}?callbackUrl=${encodeURIComponent(
    twoFactorLoginRequest.callbackUrl
  )}&token=${token}`;

  try {
    transport.sendMail({
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
  }
}
