import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = unknown;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query;
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }

  const payInvoiceRequestHeaders = new Headers();
  payInvoiceRequestHeaders.append("Accept", "application/json");
  payInvoiceRequestHeaders.append("X-Api-Key", process.env.LNBITS_API_KEY);

  const getInvoiceResponse = await fetch(
    `${process.env.LNBITS_URL}/api/v1/payments/${id}`,
    {
      method: "GET",
      headers: payInvoiceRequestHeaders,
    }
  );

  if (getInvoiceResponse.ok) {
    const invoiceData = await getInvoiceResponse.json();
    res.status(StatusCodes.OK).json(invoiceData);
  }
}
