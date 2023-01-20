import { hoursToSeconds } from "date-fns";
import { cacheRequest } from "lib/cacheRequest";
import { NextApiRequest, NextApiResponse } from "next";
import { ExchangeRates } from "types/ExchangeRates";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExchangeRates>
) {
  const exchangeRates = await cacheRequest(
    "exchangeRates",
    undefined,
    getExchangeRates,
    hoursToSeconds(24)
  );
  return res.json(exchangeRates);
}

async function getExchangeRates() {
  const btcUsdPrice = await getBtcUsdPrice();
  // console.log("BTCUSD", btcUsdPrice);
  const fiatExchangeRates = await getFiatExchangeRates();
  // console.log("fiatExchangeRates", fiatExchangeRates);

  const exchangeRates: ExchangeRates = {};
  for (const fiatExchangeRate of Object.entries(fiatExchangeRates)) {
    exchangeRates[fiatExchangeRate[0]] = btcUsdPrice * fiatExchangeRate[1];
  }
  return exchangeRates;
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
  const sources = (
    await Promise.all([
      getFiatExchangeRatesYadio(),
      getFiatExchangeRatesErApi(),
    ])
  ).filter((rates) => rates) as ExchangeRates[];

  const mergedRates: ExchangeRates = {};
  for (const source of sources) {
    for (const entry of Object.entries(source)) {
      if (!mergedRates[entry[0]]) {
        // console.log(
        //   "Adding ",
        //   entry[0],
        //   entry[1],
        //   "source",
        //   sources.indexOf(source)
        // );
        mergedRates[entry[0]] = entry[1];
      } else {
        // console.log(
        //   "Already exists ",
        //   entry[0],
        //   "primary source",
        //   mergedRates[entry[0]],
        //   "next source",
        //   entry[1]
        // );
      }
    }
  }
  return mergedRates;
}

async function getFiatExchangeRatesYadio() {
  try {
    const exchangeRatesResponse = await fetch(
      `https://api.yadio.io/exrates/USD`,
      {
        method: "GET",
      }
    );

    if (!exchangeRatesResponse.ok) {
      throw new Error("Failed to get exchange rates data");
    }

    const exhangeRates = (
      (await exchangeRatesResponse.json()) as {
        USD: { [currency: string]: number };
      }
    ).USD;

    return exhangeRates;
  } catch (error) {
    console.error("Failed to fetch exchange rates from yadio", error);
    return undefined;
  }
}
async function getFiatExchangeRatesErApi() {
  try {
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
  } catch (error) {
    console.error("Failed to fetch exchange rates from er-api", error);
    return undefined;
  }
}
