export async function deleteWithdrawLink(
  adminKey: string,
  id: string
): Promise<void> {
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }

  const getWithdrawalLinkRequestHeaders = new Headers();
  getWithdrawalLinkRequestHeaders.append("Accept", "application/json");
  getWithdrawalLinkRequestHeaders.append("X-Api-Key", adminKey);

  const getWithdrawalLinkResponse = await fetch(
    `${process.env.LNBITS_URL}/withdraw/api/v1/links/${id}`,
    {
      method: "DELETE",
      headers: getWithdrawalLinkRequestHeaders,
    }
  );

  if (!getWithdrawalLinkResponse.ok) {
    throw new Error("Failed to delete withdraw link " + id);
  }
}
