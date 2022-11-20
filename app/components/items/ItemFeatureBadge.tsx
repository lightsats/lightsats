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
    <Badge variant="flat" color="primary">
      <Icon width={14} height={14}>
        {variant === "success" ? <CheckIcon /> : <XMarkIcon />}
      </Icon>
      &nbsp;
      {name.charAt(0).toUpperCase() + name.slice(1)}
    </Badge>
  );
}
