import NodeCache from "node-cache";

declare global {
  // eslint-disable-next-line no-var
  var cache: { [key: string]: NodeCache } | undefined;
}

export async function cacheRequest<T>(
  key: "exchangeRates" | "scoreboard",
  requestFunc: () => Promise<T>,
  ageSeconds: number
) {
  const requestCache = globalThis.cache?.[key] || new NodeCache();
  globalThis.cache = globalThis.cache || {};
  globalThis.cache[key] = requestCache;

  let cachedValue: Awaited<T> | undefined = requestCache.get<Awaited<T>>(key);
  if (!cachedValue) {
    // console.log("not cached yet: " + key);
    cachedValue = await requestFunc();
    requestCache.set(key, cachedValue, ageSeconds);
  } else {
    // console.log("already cached: " + key);
  }

  return cachedValue;
}
