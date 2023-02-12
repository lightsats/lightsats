import { appName } from "lib/constants";

type CreateInvoiceRequest = {
  out: false;
  amount: number;
  memo: string;
  webhook: string | undefined;
};

type CreateInvoiceResponse = {
  payment_hash: string;
  payment_request: string;
};

export async function createFundingInvoice(
  amount: number,
  adminKey: string
): Promise<{ invoice: string; invoiceId: string }> {
  return createInvoice(
    amount,
    adminKey,
    `${appName} tip`,
    undefined // webhook no longer used (unreliable)
  );
}

export async function createInvoice(
  amount: number,
  adminKey: string,
  memo: string,
  webhook: string | undefined
): Promise<{ invoice: string; invoiceId: string }> {
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }

  const createInvoiceRequest: CreateInvoiceRequest = {
    out: false,
    amount: amount,
    memo: memo,
    webhook,
  };

  const createInvoiceRequestHeaders = new Headers();
  createInvoiceRequestHeaders.append("Content-Type", "application/json");
  createInvoiceRequestHeaders.append("Accept", "application/json");
  createInvoiceRequestHeaders.append("X-Api-Key", adminKey);

  const createInvoiceResponse = await fetch(
    `${process.env.LNBITS_URL}/api/v1/payments`,
    {
      method: "POST",
      body: JSON.stringify(createInvoiceRequest),
      headers: createInvoiceRequestHeaders,
    }
  );

  if (!createInvoiceResponse.ok) {
    let body;
    try {
      body = await createInvoiceResponse.text();
    } catch (e) {
      console.error("Failed to read create invoice response body", e);
      body = "unknown";
    }
    throw new Error(
      "Unable to create invoice: " +
        createInvoiceResponse.statusText +
        ": " +
        body
    );
  }

  let createInvoiceResponseData: CreateInvoiceResponse | undefined;
  try {
    createInvoiceResponseData =
      (await createInvoiceResponse.json()) as CreateInvoiceResponse;
  } catch (error) {
    console.error("Failed to create invoice", error);
    throw error;
  }

  return {
    invoice: createInvoiceResponseData.payment_request,
    invoiceId: createInvoiceResponseData.payment_hash,
  };
}
