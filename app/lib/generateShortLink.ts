import { generateAlphanumeric } from "lib/utils";

export async function generateShortLink(
  url: string
): Promise<string | undefined> {
  console.log("Creating short link for " + url);
  if (!process.env.SHORTIO_API_KEY || !process.env.SHORTIO_SHORT_DOMAIN) {
    console.warn("No short URL config set");
    return undefined;
  }

  const createShortLinkRequestBody = {
    originalURL: url,
    domain: process.env.SHORTIO_SHORT_DOMAIN,
    /*expiresAt: add(new Date(), {
      days: LOGIN_LINK_EXPIRATION_DAYS,
    }).getTime(),*/ // only supported with a paid plan
    path: generateAlphanumeric(10),
  };

  const requestHeaders = new Headers();
  requestHeaders.append("Accept", "application/json");
  requestHeaders.append("Content-Type", "application/json");
  requestHeaders.append("Authorization", process.env.SHORTIO_API_KEY);

  try {
    const createShortLinkResponse = await fetch(`https://api.short.io/links`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(createShortLinkRequestBody),
    });
    if (createShortLinkResponse.ok) {
      const shortLinkData = (await createShortLinkResponse.json()) as {
        shortURL: string;
      };
      if (!shortLinkData.shortURL) {
        throw new Error("No shortURL in response body");
      }

      return shortLinkData.shortURL;
    } else {
      let body;
      try {
        body = createShortLinkResponse.json();
      } catch (error) {
        body = "<failed to read>";
      }

      throw new Error(
        "Unexpected response from short.io: " +
          createShortLinkResponse.status +
          ": " +
          JSON.stringify(body)
      );
    }
  } catch (error) {
    console.error("Failed to generate short link", error);
    return undefined;
  }
}
