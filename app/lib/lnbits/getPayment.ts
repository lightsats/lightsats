import { LnbitsSinglePayment } from "types/lnbits";

export async function getPayment(
  walletAdminKey: string,
  checkingId: string
): Promise<LnbitsSinglePayment> {
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }

  const getInvoiceRequestHeaders = new Headers();
  getInvoiceRequestHeaders.append("Accept", "application/json");
  getInvoiceRequestHeaders.append("X-Api-Key", walletAdminKey);

  const getPaymentResponse = await fetch(
    `${process.env.LNBITS_URL}/api/v1/payments/${checkingId}`,
    {
      method: "GET",
      headers: getInvoiceRequestHeaders,
    }
  );

  let payment: LnbitsSinglePayment | undefined;
  try {
    payment = await getPaymentResponse.json();
    // console.log("getInvoiceStatus", invoiceStatus);
  } catch (error) {
    console.error("Failed to parse payment", error);
  }

  if (!getPaymentResponse.ok) {
    throw new Error(
      "Unable to get payment: " +
        getPaymentResponse.statusText +
        " " +
        JSON.stringify(payment)
    );
  }
  if (!payment) {
    throw new Error("Get payment did not return a response body");
  }
  return payment;
}
