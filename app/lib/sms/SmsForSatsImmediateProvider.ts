import { SMSProvider } from "types/SMSProvider";

const MAX_POLL_ATTEMPTS = 10;

const apiKey = process.env.SMS_FOR_SATS_API_KEY;

if (!apiKey) {
  console.warn("SMS_FOR_SATS_LNBITS_API_KEY not set. Please see .env.example");
}

export const smsForSatsImmediateProvider: SMSProvider = {
  name: "sms4sats.com (account based)",
  isAvailable: !!apiKey,
  sendMessage: async (to, body) => {
    if (!apiKey) {
      throw new Error("apiKey is undefined");
    }
    const createOrderStartTime = Date.now();
    let order: CreateOrderResponse;
    try {
      order = await createOrder(to, body);
    } catch (error) {
      console.error(
        smsForSatsImmediateProvider.name + ": failed to create order",
        error
      );
      return false;
    }
    console.log(
      smsForSatsImmediateProvider.name +
        ": created order in " +
        (Date.now() - createOrderStartTime) +
        "ms"
    );

    const pollOrderStartTime = Date.now();
    for (let i = 1; i <= MAX_POLL_ATTEMPTS; i++) {
      try {
        const updatedOrder = await getOrder(order.orderId);
        console.log(
          smsForSatsImmediateProvider.name +
            ": Polling " +
            " order " +
            order.orderId,
          updatedOrder,
          `(attempt ${i})`
        );
        if (updatedOrder.smsStatus === "delivered") {
          console.log(
            smsForSatsImmediateProvider.name +
              ": order updated to delivered status in " +
              (Date.now() - pollOrderStartTime) +
              "ms"
          );
          return true;
        } else if (updatedOrder.smsStatus === "failed") {
          throw new Error("order " + order.orderId + " failed to be sent");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(
          smsForSatsImmediateProvider.name +
            ": Failed to poll " +
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
  if (!apiKey) {
    throw new Error("apiKey is undefined");
  }

  const requestHeaders = new Headers();
  requestHeaders.append("Accept", "application/json");
  requestHeaders.append("Content-Type", "application/json");
  requestHeaders.append("X-API-Key", apiKey);

  const requestBody = {
    phone: to,
    message: body,
    immediate: true,
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
