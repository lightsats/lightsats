import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { Badge } from "@nextui-org/react";
import { Icon } from "components/Icon";

export type ItemFeatureBadgeProps = {
  name: string;
  variant?: "success" | "warning";
};

export function ItemFeatureBadge({
  name,
  variant = "success",
}: ItemFeatureBadgeProps) {
  return (
    <Badge>
      <Icon width={12} height={12}>
        {variant === "success" ? <CheckIcon /> : <XMarkIcon />}
      </Icon>
      &nbsp;
      {name}
    </Badge>
  );
}
