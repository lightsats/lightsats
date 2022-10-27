import { LnbitsWithdrawLink } from "types/lnbits";

type LnbitsCreateWithdrawLinkRequest = {
  title: string;
  min_withdrawable: number;
  max_withdrawable: number;
  uses: number;
  wait_time: number;
  is_unique: boolean;
  webhook_url?: string;
  use_custom: boolean;
};

type LnbitsCreateWithdrawLinkResponse = LnbitsWithdrawLink;

type CreateWithdrawLinkResponse = { lnurl: string; id: string };

export async function createWithdrawLink(
  amount: number,
  adminKey: string,
  memo: string
): Promise<CreateWithdrawLinkResponse> {
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }

  const createWithdrawLinkRequest: LnbitsCreateWithdrawLinkRequest = {
    title: memo,
    min_withdrawable: amount,
    max_withdrawable: amount,
    uses: 1,
    is_unique: false,
    wait_time: 1,
    use_custom: false,
    webhook_url: `${process.env.APP_URL}/withdraw/api/webhooks/withdrawLinks?key=${process.env.LNBITS_WEBHOOK_SECRET_KEY}`,
  };

  const createWithdrawLinkRequestHeaders = new Headers();
  createWithdrawLinkRequestHeaders.append("Content-Type", "application/json");
  createWithdrawLinkRequestHeaders.append("Accept", "application/json");
  createWithdrawLinkRequestHeaders.append("X-Api-Key", adminKey);

  const createWithdrawLinkResponse = await fetch(
    `${process.env.LNBITS_URL}/withdraw/api/v1/links`,
    {
      method: "POST",
      body: JSON.stringify(createWithdrawLinkRequest),
      headers: createWithdrawLinkRequestHeaders,
    }
  );

  // console.log("createWithdrawLinkResponse", createWithdrawLinkResponse);

  if (!createWithdrawLinkResponse.ok) {
    throw new Error(
      "Unable to create invoice: " + createWithdrawLinkResponse.statusText
    );
  }

  let createWithdrawLinkResponseData:
    | LnbitsCreateWithdrawLinkResponse
    | undefined;
  try {
    createWithdrawLinkResponseData =
      (await createWithdrawLinkResponse.json()) as LnbitsCreateWithdrawLinkResponse;
    console.log("createWithdrawLinkResponse", createWithdrawLinkResponseData);
  } catch (error) {
    console.error("Failed to create withdraw link", error);
    throw error;
  }

  return {
    lnurl: createWithdrawLinkResponseData.lnurl,
    id: createWithdrawLinkResponseData.id,
  };
}
