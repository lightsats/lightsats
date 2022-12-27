// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  test: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return res.json({ test: "John Galt" });
}
