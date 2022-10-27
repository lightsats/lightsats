import { LnbitsWithdrawLink } from "types/lnbits";

export async function getWithdrawLink(
  adminKey: string,
  id: string
): Promise<LnbitsWithdrawLink> {
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }

  const getWithdrawalLinkRequestHeaders = new Headers();
  getWithdrawalLinkRequestHeaders.append("Accept", "application/json");
  getWithdrawalLinkRequestHeaders.append("X-Api-Key", adminKey);

  const getWithdrawalLinkResponse = await fetch(
    `${process.env.LNBITS_URL}/withdraw/api/v1/links/${id}`,
    {
      method: "GET",
      headers: getWithdrawalLinkRequestHeaders,
    }
  );

  let withdrawalLink: LnbitsWithdrawLink | undefined;
  try {
    withdrawalLink = await getWithdrawalLinkResponse.json();
    // console.log("getWithdrawalLinksStatus", invoiceStatus);
  } catch (error) {
    console.error("Failed to get withdrawal link: " + id, error);
  }

  if (!getWithdrawalLinkResponse.ok) {
    throw new Error(
      "Unable to get withdrawal link" +
        id +
        ": " +
        getWithdrawalLinkResponse.statusText +
        " " +
        JSON.stringify(withdrawalLink)
    );
  }
  if (!withdrawalLink) {
    throw new Error("Get withdrawal link did not return a response body");
  }

  return withdrawalLink;
}
