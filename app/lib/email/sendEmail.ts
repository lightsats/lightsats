import * as nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

if (
  !process.env.EMAIL_SERVER_USER ||
  !process.env.EMAIL_SERVER_PASSWORD ||
  !process.env.EMAIL_SERVER_HOST ||
  !process.env.EMAIL_SERVER_PORT ||
  !process.env.EMAIL_FROM
) {
  throw new Error("Email config not setup. Please see .env.example");
}

const transports: nodemailer.Transporter<SMTPTransport.SentMessageInfo>[] = [];

transports.push(
  nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    from: `Lightsats <${process.env.EMAIL_FROM}>`,
  })
);

if (
  process.env.EMAIL_SERVER_HOST_2 &&
  process.env.EMAIL_SERVER_PORT_2 &&
  process.env.EMAIL_SERVER_USER_2 &&
  process.env.EMAIL_SERVER_PASSWORD_2 &&
  process.env.EMAIL_FROM_2
) {
  transports.push(
    nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST_2,
      port: parseInt(process.env.EMAIL_SERVER_PORT_2),
      auth: {
        user: process.env.EMAIL_SERVER_USER_2,
        pass: process.env.EMAIL_SERVER_PASSWORD_2,
      },
      from: `Lightsats <${process.env.EMAIL_FROM_2}>`,
    })
  );
}

export const sendEmail = async (args: {
  to: string;
  subject: string;
  html: string;
}) => {
  // prioritize more recently addded transport
  for (let i = transports.length - 1; i >= 0; i--) {
    try {
      await transports[i].sendMail({
        ...args,
        from: transports[i].options.from,
      });
      break;
    } catch (error) {
      console.error("Failed to send email with transport " + i, error, args);
    }
  }
};
