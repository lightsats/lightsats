export type WithdrawalFlow = "tipper" | "tippee";

export type WithdrawalRequest = {
  invoice: string;
  flow: WithdrawalFlow;
};
