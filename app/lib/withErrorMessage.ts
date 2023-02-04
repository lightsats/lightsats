import { NextApiResponse } from "next";
import { ErrorResponse } from "types/ErrorResponse";

export function withErrorMessage(
  res: NextApiResponse<ErrorResponse>,
  errorMessage: string
) {
  return res.json({ errorMessage });
}
