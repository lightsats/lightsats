export function getWithdrawalLinkUrl(withdrawalLinkId: string): string {
  return `${process.env.APP_URL}/api/withdrawalLinks/${withdrawalLinkId}`;
}
