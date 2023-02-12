import { Badge } from "@nextui-org/react";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export function TipGroupStatusBadge({
  tipGroup,
}: {
  tipGroup: TipGroupWithTips;
}) {
  //css={{ background: getTipGroupBackground(tipGroup) }}
  const status = tipGroup.status;
  let color: React.ComponentProps<typeof Badge>["color"] =
    status === "UNFUNDED" ? "error" : "primary";

  if (tipGroup.tips.every((tip) => tip.status === "RECLAIMED")) {
    color = "warning";
  } else if (tipGroup.tips.every((tip) => tip.status === "REFUNDED")) {
    color = "default";
  } else if (
    tipGroup.tips.every(
      (tip) => tip.status === "WITHDRAWN" || tip.status === "REFUNDED"
    )
  ) {
    color = "success";
  }
  return (
    <Badge
      variant="flat"
      color={color}
      css={{
        letterSpacing: 0,
        textTransform: "capitalize",
      }}
    >
      {(color === "default"
        ? "Refunded"
        : color === "warning"
        ? "Reclaimed"
        : color === "success"
        ? "Completed"
        : status
      ).toLowerCase()}
    </Badge>
  );
}
