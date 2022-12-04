import { Text } from "@nextui-org/react";
import { AchievementType } from "@prisma/client";

type Props = {
  achievement: AchievementType;
};

export function AchievementBadge(props: Props) {
  return (
    <Text b css={{ m: 0, p: 0, color: "#FD5C00" }}>
      #{Object.values(AchievementType).indexOf(props.achievement)}
    </Text>
  );
}
