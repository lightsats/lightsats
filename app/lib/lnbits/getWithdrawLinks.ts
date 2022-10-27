import { LnbitsWithdrawLink } from "types/lnbits";

export async function getWithdrawLinks(
  adminKey: string
): Promise<LnbitsWithdrawLink[]> {
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }

  const getWithdrawalLinksRequestHeaders = new Headers();
  getWithdrawalLinksRequestHeaders.append("Accept", "application/json");
  getWithdrawalLinksRequestHeaders.append("X-Api-Key", adminKey);

  const getWithdrawalLinksResponse = await fetch(
    `${process.env.LNBITS_URL}/withdraw/api/v1/links`,
    {
      method: "GET",
      headers: getWithdrawalLinksRequestHeaders,
    }
  );

  let withdrawalLinks: LnbitsWithdrawLink[] | undefined;
  try {
    withdrawalLinks = await getWithdrawalLinksResponse.json();
    // console.log("getWithdrawalLinksStatus", invoiceStatus);
  } catch (error) {
    console.error("Failed to get existing withdrawal links", error);
  }

  if (!getWithdrawalLinksResponse.ok) {
    throw new Error(
      "Unable to get existing withdrawal links: " +
        getWithdrawalLinksResponse.statusText +
        " " +
        JSON.stringify(withdrawalLinks)
    );
  }
  if (!withdrawalLinks) {
    throw new Error("Get withdrawal links did not return a response body");
  }

  return withdrawalLinks;
}
