import { SMSProvider } from "types/SMSProvider";

const MAX_POLL_ATTEMPTS = 10;

const apiKey = process.env.SMS_FOR_SATS_API_KEY;

if (!apiKey) {
  console.warn("SMS_FOR_SATS_LNBITS_API_KEY not set. Please see .env.example");
}

export const smsForSatsAccountProvider: SMSProvider = {
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
        smsForSatsAccountProvider.name + ": failed to create order",
        error
      );
      return false;
    }
    console.log(
      smsForSatsAccountProvider.name +
        ": created order in " +
        (Date.now() - createOrderStartTime) +
        "ms"
    );

    // TODO: use webhook
    const pollOrderStartTime = Date.now();
    for (let i = 1; i <= MAX_POLL_ATTEMPTS; i++) {
      try {
        const updatedOrder = await getOrder(order.orderId);
        console.log(
          smsForSatsAccountProvider.name +
            ": Polling " +
            " order " +
            order.orderId,
          updatedOrder,
          `(attempt ${i})`
        );
        if (
          updatedOrder.smsStatus === "sent" ||
          updatedOrder.smsStatus === "delivered"
        ) {
          console.log(
            smsForSatsAccountProvider.name +
              ": order updated to sent status in " +
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
          smsForSatsAccountProvider.name +
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
      smsForSatsAccountProvider.name +
        ": Get order status returned unexpected HTTP status: " +
        response.status
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
      smsForSatsAccountProvider.name +
        ": Create send order returned unexpected HTTP status: " +
        response.status
    );
  }
}

type GetAccountBalanceResponse = {
  status: "OK";
  balance: number;
};

export async function getSmsForSatsAccountBalance(): Promise<number> {
  if (!apiKey) {
    throw new Error("apiKey is undefined");
  }

  const requestHeaders = new Headers();
  requestHeaders.append("Accept", "application/json");
  requestHeaders.append("X-API-Key", apiKey);

  const response = await fetch(`https://api2.sms4sats.com/balance`, {
    method: "GET",
    headers: requestHeaders,
  });
  if (response.ok) {
    const responseData = (await response.json()) as GetAccountBalanceResponse;
    if (responseData.status !== "OK") {
      throw new Error("Failed to get account balance: " + responseData.status);
    }
    return responseData.balance;
  } else {
    throw new Error(
      smsForSatsAccountProvider.name +
        ": Get account balance returned unexpected HTTP status: " +
        response.status
    );
  }
}

type FundAccountResponse = {
  status: "OK";
  orderId: string;
  payreq: string;
};

export async function fundSmsForSatsAccountBalance(
  amount: number
): Promise<string> {
  if (!apiKey) {
    throw new Error("apiKey is undefined");
  }

  const requestHeaders = new Headers();
  requestHeaders.append("Accept", "application/json");
  requestHeaders.append("Content-Type", "application/json");
  requestHeaders.append("X-API-Key", apiKey);

  const response = await fetch(`https://api2.sms4sats.com/fund`, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
      amount,
    }),
  });
  if (response.ok) {
    const responseData = (await response.json()) as FundAccountResponse;
    if (responseData.status !== "OK") {
      throw new Error("Failed to get account balance: " + responseData.status);
    }
    return responseData.payreq;
  } else {
    throw new Error(
      smsForSatsAccountProvider.name +
        ": Fund account balance returned unexpected HTTP status: " +
        response.status
    );
  }
}
