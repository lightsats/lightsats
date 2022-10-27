export async function enableLnbitsExtension(
  lnbitsUserId: string,
  extension: "withdraw"
): Promise<boolean> {
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }

  const enableExtensionRequestHeaders = new Headers();
  enableExtensionRequestHeaders.append("Content-Type", "application/json");
  enableExtensionRequestHeaders.append("Accept", "application/json");
  enableExtensionRequestHeaders.append("X-Api-Key", process.env.LNBITS_API_KEY);

  console.log("Enabling lnwithdraw extension for lnbits user " + lnbitsUserId);
  const enableExtensionResponse = await fetch(
    `${process.env.LNBITS_URL}/usermanager/api/v1/extensions?userid=${lnbitsUserId}&extension=${extension}&active=true`,
    {
      method: "POST",
      headers: enableExtensionRequestHeaders,
    }
  );

  if (!enableExtensionResponse.ok) {
    throw new Error(
      "Unable to enable extension for user " +
        lnbitsUserId +
        " : " +
        enableExtensionResponse.statusText
    );
  }

  return enableExtensionResponse.ok;
}
