type GetWalletResponse = {
  balance: number;
};

export async function getWalletBalance(walletAdminKey: string) {
  const getWalletRequestHeaders = new Headers();
  getWalletRequestHeaders.append("Accept", "application/json");
  getWalletRequestHeaders.append("X-Api-Key", walletAdminKey);

  const getWalletResponse = await fetch(
    `${process.env.LNBITS_URL}/api/v1/wallet`,
    {
      method: "GET",
      headers: getWalletRequestHeaders,
    }
  );

  let getWalletResponseBody: GetWalletResponse | undefined;
  try {
    getWalletResponseBody = await getWalletResponse.json();
    // console.log("getWallet", getWalletResponseBody);
  } catch {
    console.error("Failed to parse wallet body");
  }

  if (!getWalletResponse.ok) {
    throw new Error(
      "Unable to get wallet: " +
        getWalletResponse.statusText +
        " " +
        JSON.stringify(getWalletResponseBody)
    );
  }
  if (!getWalletResponseBody) {
    throw new Error("Get wallet did not return a response body");
  }
  if (isNaN(getWalletResponseBody.balance)) {
    throw new Error("Get wallet did not return a valid balance");
  }

  // wallet balance is in millisats
  return getWalletResponseBody.balance / 1000;
}
