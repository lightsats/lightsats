import { LnbitsCollectionPayment } from "types/lnbits";

export async function getPayments(
  walletAdminKey: string
  //complete: boolean,
  //since: number
): Promise<LnbitsCollectionPayment[]> {
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }

  const getInvoiceRequestHeaders = new Headers();
  getInvoiceRequestHeaders.append("Accept", "application/json");
  getInvoiceRequestHeaders.append("X-Api-Key", walletAdminKey);

  // TODO: filter on complete=${complete}&since=${since} (seems these filters aren't available yet)
  const getPaymentResponse = await fetch(
    `${process.env.LNBITS_URL}/api/v1/payments`, //?complete=${complete}&since=${since}
    {
      method: "GET",
      headers: getInvoiceRequestHeaders,
    }
  );

  let payments: LnbitsCollectionPayment[] | undefined;
  try {
    payments = await getPaymentResponse.json();
    // console.log("getInvoiceStatus", invoiceStatus);
  } catch (error) {
    console.error("Failed to parse payment", error);
  }

  if (!getPaymentResponse.ok) {
    throw new Error(
      "Unable to get payments: " +
        getPaymentResponse.statusText +
        " " +
        JSON.stringify(payments)
    );
  }
  if (!payments) {
    throw new Error("Get payments did not return a response body");
  }
  return payments;
}
