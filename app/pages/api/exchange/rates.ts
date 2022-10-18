import { hoursToSeconds } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import NodeCache from "node-cache";
import { ExchangeRates } from "types/ExchangeRates";

const exchangeRatesCacheKey = "exchangeRates";

declare global {
  // eslint-disable-next-line no-var
  var exchangeRatesCache: NodeCache | undefined;
}

const exchangeRatesCache = globalThis.exchangeRatesCache || new NodeCache();
if (process.env.NODE_ENV !== "production")
  globalThis.exchangeRatesCache = exchangeRatesCache;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExchangeRates>
) {
  let exchangeRates = exchangeRatesCache.get<ExchangeRates>(
    exchangeRatesCacheKey
  );
  if (!exchangeRates) {
    const btcUsdPrice = await getBtcUsdPrice();
    console.log("BTCUSD", btcUsdPrice);
    const fiatExchangeRates = await getFiatExchangeRates();
    console.log("fiatExchangeRates", fiatExchangeRates);

    exchangeRates = {};
    for (const fiatExchangeRate of Object.entries(fiatExchangeRates)) {
      exchangeRates[fiatExchangeRate[0]] = btcUsdPrice * fiatExchangeRate[1];
    }
    console.log("exchangeRates", exchangeRates);

    exchangeRatesCache.set(
      exchangeRatesCacheKey,
      exchangeRates,
      hoursToSeconds(24)
    );
  } else {
    // console.log("Exchange rates are cached");
  }

  return res.json(exchangeRates);
}

async function getBtcUsdPrice() {
  const tickerResponse = await fetch(
    `https://api.kraken.com/0/public/Ticker?pair=XBTUSD`,
    {
      method: "GET",
    }
  );

  if (!tickerResponse.ok) {
    throw new Error("Failed to get kraken ticker data");
  }

  const responseBody = (await tickerResponse.json()) as {
    result: {
      [pair: string]: { p: string[] };
    };
  };

  return parseFloat(Object.values(responseBody.result)[0].p[0]);
}

async function getFiatExchangeRates() {
  const exchangeRatesResponse = await fetch(
    `https://open.er-api.com/v6/latest/USD`,
    {
      method: "GET",
    }
  );

  if (!exchangeRatesResponse.ok) {
    throw new Error("Failed to get exchange rates data");
  }

  const exhangeRates = (
    (await exchangeRatesResponse.json()) as {
      rates: { [currency: string]: number };
    }
  ).rates;

  return exhangeRates;
}
