import { WithdrawalFlow, WithdrawalMethod } from "@prisma/client";
import fetch from "cross-fetch";
import { StatusCodes } from "http-status-codes";
import { createNotification } from "lib/createNotification";
import { payWithdrawalInvoice } from "lib/payWithdrawalInvoice";
import prisma from "lib/prismadb";
import { getWithdrawableTipsQuery } from "lib/withdrawal";
import { withErrorMessage } from "lib/withErrorMessage";
import type { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse } from "types/ErrorResponse";
// import {LightningAddress} from "alby-tools";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<never | ErrorResponse>
) {
  const { id } = req.query;
  if (req.method !== "POST") {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  const { apiKey } = req.query;
  const validApiKey = !!(process.env.API_KEY && apiKey === process.env.API_KEY);
  if (!validApiKey) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id as string,
    },
  });
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  if (!user.lightningAddress) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  const withdrawalFlow: WithdrawalFlow = "tipper";
  const withdrawalMethod: WithdrawalMethod = "lightning_address";

  const tips = await prisma.tip.findMany({
    where: getWithdrawableTipsQuery(withdrawalFlow, user.id, undefined),
    include: {
      tipper: true,
    },
  });

  if (!tips.length) {
    const errorMessage = "No tips are available to withdraw";
    throw new Error(errorMessage);
  }

  const amount = tips.map((tip) => tip.amount).reduce((a, b) => a + b);

  let invoice: string | undefined;

  try {
    invoice = await createLnurlPayInvoice(user.lightningAddress, amount);
    if (!invoice) {
      throw new Error(
        "No lnurlPay invoice created for lightning address " +
          user.lightningAddress
      );
    }
    console.log("TODO: pay invoice", invoice);

    await payWithdrawalInvoice(
      withdrawalFlow,
      invoice,
      user.id,
      undefined,
      withdrawalMethod,
      undefined
    );

    try {
      await createNotification(user.id, "AUTOMATIC_REFUND", undefined);
    } catch (error) {
      console.error(
        "Failed to create automatic refund to lightning address notification",
        error
      );
    }

    return res.status(StatusCodes.NO_CONTENT).end();
  } catch (error) {
    const errorMessage =
      "Failed to execute withdrawal to lightning address for user " +
      user.id +
      ": " +
      JSON.stringify(error, Object.getOwnPropertyNames(error));

    console.error(errorMessage, error);

    await prisma.withdrawalError.create({
      data: {
        message: errorMessage,
        userId: user.id,
        withdrawalFlow,
        withdrawalMethod,
        withdrawalInvoice: invoice,
      },
    });

    return withErrorMessage(
      res.status(StatusCodes.INTERNAL_SERVER_ERROR),
      (error as Error).message
    );
  }
}

async function createLnurlPayInvoice(lightningAddress: string, amount: number) {
  const ln = new LightningAddress(lightningAddress);

  // fetch the LNURL data
  await ln.fetch();

  // get the LNURL-pay data:
  console.log(ln.lnurlpData); // returns a [LNURLPayPesponse](https://github.com/getAlby/alby-tools/blob/master/src/types.ts#L1-L15)

  const invoice = (await ln.requestInvoice(amount, "Lightsats reclaimed sats"))
    .paymentRequest;
  return invoice;
}

// TODO: replace with alby-tools NPM package when published
////////////////////////////////////////////////////////////////////////////////

type InvoiceArgs = {
  pr: string;
  verify?: string;
  preimage?: string;
};

const LN_ADDRESS_REGEX =
  // eslint-disable-next-line no-useless-escape
  /^((?:[^<>()\[\]\\.,;:\s@"]+(?:\.[^<>()\[\]\\.,;:\s@"]+)*)|(?:".+"))@((?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(?:(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const URL_REGEX =
  // eslint-disable-next-line no-useless-escape
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

class LightningAddress {
  address: string;
  username: string | undefined;
  domain: string | undefined;
  pubkey: string | undefined;
  lnurlpData: Record<string, string | number>;

  constructor(address: string) {
    this.address = address;
    this.parse();
    this.lnurlpData = {};
  }

  parse() {
    const result = LN_ADDRESS_REGEX.exec(this.address.toLowerCase());
    if (result) {
      this.username = result[1];
      this.domain = result[2];
    }
  }

  async fetch() {
    return this.fetchWithoutProxy();
  }

  async fetchWithoutProxy() {
    try {
      const lnurlResult = await fetch(this.lnurlpUrl());
      this.lnurlpData = await lnurlResult.json();
    } catch (e) {
      console.error(e);
    }
  }

  lnurlpUrl() {
    return `https://${this.domain}/.well-known/lnurlp/${this.username}`;
  }

  async generateInvoice(url: URL): Promise<Invoice> {
    const data = await fetch(url);
    const json = await data.json();
    const paymentRequest = json && json.pr && json.pr.toString();
    if (!paymentRequest) throw new Error("Invalid pay service invoice");

    const invoiceArgs: InvoiceArgs = { pr: paymentRequest };
    if (json && json.verify) invoiceArgs.verify = json.verify.toString();

    return new Invoice(invoiceArgs);
  }

  async requestInvoice(amount: number, comment?: string): Promise<Invoice> {
    const msat = amount * 1000;
    const { callback, commentAllowed, min, max } = parseLnUrlPayResponse(
      this.lnurlpData
    );

    if (!isValidAmount({ amount: msat, min, max }))
      throw new Error("Invalid amount");
    if (!isUrl(callback)) throw new Error("Callback must be a valid url");
    if (comment && commentAllowed > 0 && comment.length > commentAllowed)
      throw new Error(
        `The comment length must be ${commentAllowed} characters or fewer`
      );

    const invoiceParams: { amount: string; comment?: string } = {
      amount: msat.toString(),
    };
    if (comment) invoiceParams.comment = comment;

    const callbackUrl = new URL(callback);
    callbackUrl.search = new URLSearchParams(invoiceParams).toString();

    return this.generateInvoice(callbackUrl);
  }
}

export const isUrl = (url: string | null): url is string => {
  if (!url) return false;
  return URL_REGEX.test(url);
};

export const isValidAmount = ({
  amount,
  min,
  max,
}: {
  amount: number;
  min: number;
  max: number;
}): boolean => {
  const isValid = amount > 0 && amount >= min && amount <= max;
  const isFixed = min === max;
  return isValid && isFixed ? amount === min : isValid;
};

const TAG_PAY_REQUEST = "payRequest";

type LnUrlPayResponse = {
  callback: string;
  fixed: boolean;
  min: number;
  max: number;
  domain?: string;
  metadata: Array<Array<string>>;
  identifier: string;
  description: string;
  image: string;
  commentAllowed: number;
  rawData: { [key: string]: string | number };
  allowsNostr: boolean;
};

// From: https://github.com/dolcalmi/lnurl-pay/blob/main/src/request-pay-service-params.ts
export const parseLnUrlPayResponse = (
  data: Record<string, string | number>
): LnUrlPayResponse => {
  if (data.tag !== TAG_PAY_REQUEST)
    throw new Error("Invalid pay service params");

  const callback = (data.callback + "").trim();

  const min = Math.ceil(Number(data.minSendable || 0) / 1000);
  const max = Math.floor(Number(data.maxSendable) / 1000);
  if (!(min && max) || min > max) throw new Error("Invalid pay service params");

  let metadata: Array<Array<string>>;
  try {
    metadata = JSON.parse(data.metadata + "");
  } catch {
    metadata = [];
  }

  let image = "";
  let description = "";
  let identifier = "";
  for (let i = 0; i < metadata.length; i++) {
    const [k, v] = metadata[i];
    switch (k) {
      case "text/plain":
        description = v;
        break;
      case "text/identifier":
        identifier = v;
        break;
      case "image/png;base64":
      case "image/jpeg;base64":
        image = "data:" + k + "," + v;
        break;
    }
  }

  let domain;
  try {
    domain = new URL(callback).hostname;
  } catch {
    // fail silently and let domain remain undefined if callback is not a valid URL
  }

  return {
    callback,
    fixed: min === max,
    min,
    max,
    domain,
    metadata,
    identifier,
    description,
    image,
    commentAllowed: Number(data.commentAllowed) || 0,
    rawData: data,
    allowsNostr: Boolean(data.allowsNostr),
  };
};

class Invoice {
  paymentRequest: string;

  constructor(args: InvoiceArgs) {
    this.paymentRequest = args.pr;
  }
}
