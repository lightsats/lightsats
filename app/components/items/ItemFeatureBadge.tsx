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
    <Badge
      //color={feature.variant === "success" ? "white" : feature.variant}
      //size="small"
      css={{
        background: "transparent",
        borderColor: "$gray600",
        color: `$${feature.variant}`,
        opacity: 0.75,
      }}
    >
      {feature.name}&nbsp;
      {getIcon(feature.variant === "success")}
    </Badge>
  );
}
