import { CheckIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { Badge } from "@nextui-org/react";
import { Icon } from "components/Icon";

const getIcon = (success: boolean) => (
  <Icon width={12} height={12}>
    {success ? <CheckIcon /> : <ExclamationCircleIcon />}
  </Icon>
);

export type ItemFeatureBadgeProps = {
  name: string;
  variant: "success" | "warning" | "error";
};

export function ItemFeatureBadge(feature: ItemFeatureBadgeProps) {
  return (
    <Badge variant="bordered" color="primary">
      {getIcon(feature.variant === "success")}
      &nbsp;{feature.name}&nbsp;
    </Badge>
  );
}
