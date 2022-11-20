import { defaultFetcher } from "lib/swr";
import useSWR from "swr";
import { ExchangeRates } from "types/ExchangeRates";

export function useExchangeRates() {
  return useSWR<ExchangeRates>(`/api/exchange/rates`, defaultFetcher);
}
