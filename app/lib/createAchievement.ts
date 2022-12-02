import { Achievement, AchievementType } from "@prisma/client";
import { createNotification } from "lib/createNotification";
import prisma from "lib/prismadb";

export async function createAchievement(
  userId: string,
  type: AchievementType,
  achievements?: Achievement[]
) {
  achievements =
    achievements ??
    (await prisma.achievement.findMany({
      where: {
        userId,
      },
    }));

  if (!achievements.some((achievement) => achievement.type === type)) {
    await prisma.achievement.create({
      data: {
        userId,
        type,
      },
    });
    await createNotification(userId, "ACHIEVEMENT_UNLOCKED", undefined, type);
  }
}
