import prisma from "lib/prismadb";

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      roles: true,
    },
  });
  if (!user || !user.roles.some((role) => role.roleType === "SUPERADMIN")) {
    return false;
  }
  return true;
}
