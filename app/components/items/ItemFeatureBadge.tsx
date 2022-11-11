import { CheckIcon } from "@heroicons/react/24/solid";
import { Badge } from "@nextui-org/react";
import { Icon } from "components/Icon";

export type ItemFeatureBadgeProps = {
  name: string;
};

export function ItemFeatureBadge(feature: ItemFeatureBadgeProps) {
  return (
    <Badge>
      <Icon width={12} height={12}>
        <CheckIcon />
      </Icon>
      &nbsp;
      {feature.name}
    </Badge>
  );
}
