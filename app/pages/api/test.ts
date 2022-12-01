// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  test: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return res.status(StatusCodes.OK).json({ test: "John Galt" });
}
