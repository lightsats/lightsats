import { payInvoice } from "lib/lnbits/payInvoice";
import { SMSProvider } from "types/SMSProvider";

const MAX_POLL_ATTEMPTS = 10;

const walletApiKey = process.env.SMS_FOR_SATS_LNBITS_API_KEY;

if (!walletApiKey) {
  console.warn("SMS_FOR_SATS_LNBITS_API_KEY not set. Please see .env.example");
}

export const smsForSatsProvider: SMSProvider = {
  name: "smsforsats.com",
  isAvailable: !!walletApiKey,
  sendMessage: async (to, body) => {
    if (!walletApiKey) {
      throw new Error("walletApiKey is undefined");
    }
    let order: CreateOrderResponse;
    try {
      order = await createOrder(to, body);
    } catch (error) {
      console.error("SmsForSats: failed to create order", error);
      return false;
    }

    try {
      const { payInvoiceResponse } = await payInvoice(
        order.payreq,
        walletApiKey
      );
      if (!payInvoiceResponse.ok) {
        throw new Error(
          "Failed to pay invoice for " +
            smsForSatsProvider.name +
            " order " +
            order.orderId
        );
      }
    } catch (error) {
      console.error(smsForSatsProvider.name + ": failed to fund order", error);
      return false;
    }

    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
      try {
        const updatedOrder = await getOrder(order.orderId);
        console.log(
          "Polling " + smsForSatsProvider.name + " order " + order.orderId,
          updatedOrder
        );
        if (updatedOrder.smsStatus === "delivered") {
          return true;
        } else if (updatedOrder.smsStatus === "failed") {
          throw new Error("order " + order.orderId + " failed to be sent");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(
          "Failed to poll " +
            smsForSatsProvider.name +
            " order " +
            order.orderId,
          error
        );
      }
    }

    return false;
  },
};

type GetOrderResponse = {
  status: "OK";
  paid: true;
  id: string;
  smsStatus: "created" | "sent" | "delivered" | "failed";
  timestamp: number;
};

async function getOrder(orderId: string): Promise<GetOrderResponse> {
  const requestHeaders = new Headers();
  requestHeaders.append("Accept", "application/json");

  const response = await fetch(
    `https://api2.sms4sats.com/orderstatus?orderId=${orderId}`,
    {
      method: "GET",
      headers: requestHeaders,
    }
  );
  if (response.ok) {
    const responseData = (await response.json()) as GetOrderResponse;
    if (responseData.status !== "OK") {
      throw new Error("Failed to create send order: " + responseData.status);
    }
    return responseData;
  } else {
    throw new Error(
      "Get order status returned unexpected HTTP status: " + response.status
    );
  }
}

type CreateOrderResponse = {
  status: "OK";
  orderId: string;
  payreq: string;
};

async function createOrder(
  to: string,
  body: string
): Promise<CreateOrderResponse> {
  const requestHeaders = new Headers();
  requestHeaders.append("Accept", "application/json");
  requestHeaders.append("Content-Type", "application/json");

  const requestBody = {
    phone: to,
    message: body,
  };

  const response = await fetch(`https://api2.sms4sats.com/createsendorder`, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify(requestBody),
  });
  if (response.ok) {
    const responseData = (await response.json()) as CreateOrderResponse;
    if (responseData.status !== "OK") {
      throw new Error("Failed to create send order: " + responseData.status);
    }
    return responseData;
  } else {
    throw new Error(
      "Create send order returned unexpected HTTP status: " + response.status
    );
  }
}
