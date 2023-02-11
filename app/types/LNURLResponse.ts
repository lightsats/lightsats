export type LNURLResponse =
  | {
      status: "OK";
    }
  | {
      status: "ERROR";
      reason: string;
    };
