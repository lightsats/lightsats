export type LnbitsWithdrawLink = {
  id: string;
  // wallet: string,
  title: string;
  min_withdrawable: number;
  // max_withdrawable: number,
  // uses: number,
  // wait_time: number,
  // is_unique: boolean,
  // unique_hash: string;
  // k1: string;
  open_time: number;
  used: number;
  // usescsv: string,
  // number: number,
  // webhook_url: string,
  //custom_url: null,
  lnurl: string;
};

type LnbitsPaymentDetails = {
  checking_id: string;
  pending: boolean;
  amount: number;
  fee: number;
  memo: string;
  time: number;
  bolt11: string;
  preimage: string;
  payment_hash: string;
  extra: unknown;
  wallet_id: string;
  webhook: string | null;
  webhook_status: unknown;
};

export type LnbitsSinglePayment = {
  paid: boolean;
  preimage: string;
  details: LnbitsPaymentDetails;
};

export type LnbitsCollectionPayment = LnbitsPaymentDetails;
