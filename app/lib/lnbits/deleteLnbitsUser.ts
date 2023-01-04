export async function deleteLnbitsUser(lnbitsUserId: string) {
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }
  const deleteWalletRequestHeaders = new Headers();
  deleteWalletRequestHeaders.append("X-Api-Key", process.env.LNBITS_API_KEY);

  const deleteLnbitsUserResponse = await fetch(
    `${process.env.LNBITS_URL}/usermanager/api/v1/users/${lnbitsUserId}`,
    {
      method: "DELETE",
      headers: deleteWalletRequestHeaders,
    }
  );
  console.log(
    "Delete tip lnbits user + wallet response for lnbits user " +
      lnbitsUserId +
      ": ",
    deleteLnbitsUserResponse.status,
    deleteLnbitsUserResponse.statusText
  );
}
