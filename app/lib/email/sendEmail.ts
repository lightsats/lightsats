import * as nodemailer from "nodemailer";

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
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const sendEmail = (...args: Parameters<typeof transport.sendMail>) => {
  try {
    transport.sendMail(...args);
  } catch (error) {
    console.error("Failed to send email", error, args);
  }
};
