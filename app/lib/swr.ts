export const defaultFetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());
