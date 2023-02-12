import { Grid } from "@nextui-org/react";
import { TipStatus } from "@prisma/client";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export function TipGroupProgress({ tipGroup }: { tipGroup: TipGroupWithTips }) {
  const tipStatusCounts = Object.values(TipStatus)
    .map((status) => ({
      status,
      count: tipGroup.tips.filter((tip) => tip.status === status).length,
    }))
    .filter((entry) => entry.count > 0);
  return (
    <Grid.Container css={{ gap: "$2" }}>
      {tipStatusCounts.map((entry) => (
        <Grid key={entry.status}>
          <TipStatusBadge tip={entry} />
        </Grid>
      ))}
    </Grid.Container>
  );
}
