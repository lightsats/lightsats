type PayInvoiceRequest = {
  out: true;
  bolt11: string;
};

type PayInvoiceResponse = {
  payment_hash: string;
  checking_id: string;
};

export async function payInvoice(
  invoice: string,
  adminKey: string
): Promise<{
  payInvoiceResponse: Response;
  payInvoiceResponseBody: PayInvoiceResponse | undefined;
}> {
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }
  const payInvoiceRequest: PayInvoiceRequest = {
    out: true,
    bolt11: invoice,
  };

  const payInvoiceRequestHeaders = new Headers();
  payInvoiceRequestHeaders.append("Content-Type", "application/json");
  payInvoiceRequestHeaders.append("Accept", "application/json");
  payInvoiceRequestHeaders.append("X-Api-Key", adminKey);

  const payInvoiceResponse = await fetch(
    `${process.env.LNBITS_URL}/api/v1/payments`,
    {
      method: "POST",
      body: JSON.stringify(payInvoiceRequest),
      headers: payInvoiceRequestHeaders,
    }
  );

  console.log(
    "payInvoiceResponse",
    payInvoiceResponse.status,
    payInvoiceResponse.statusText
  );
  let payInvoiceResponseBody: PayInvoiceResponse | undefined;
  try {
    payInvoiceResponseBody = await payInvoiceResponse.json();
    console.log("payInvoiceResponse - responseBody", payInvoiceResponseBody);
  } catch {
    console.error("Failed to parse payInvoiceResponse body");
  }
  return { payInvoiceResponse, payInvoiceResponseBody };
}
