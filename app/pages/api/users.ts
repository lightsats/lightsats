// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, User } from '@prisma/client'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User[]>
) {
  
  const prisma = new PrismaClient();
  try {

    await prisma.user.create({
      data: {
        name: 'Test'
      }
    })
  }
  catch(error) {
    console.error(error);
  }

  const users = await prisma.user.findMany();

  res.status(200).json(users);
}
