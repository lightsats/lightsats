import { Grid } from "@nextui-org/react";
import { TipStatus } from "@prisma/client";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export function TipGroupProgress({ tipGroup }: { tipGroup: TipGroupWithTips }) {
  const tipStatusCounts = (
    [] as { status: TipStatus; claimLinkViewed: boolean; count: number }[]
  ).concat(
    ...[true, false].map((claimLinkViewed) =>
      Object.values(TipStatus)
        .map((status) => ({
          status,
          count: tipGroup.tips.filter(
            (tip) =>
              tip.status === status &&
              (!claimLinkViewed ||
                (tip.status === "UNCLAIMED" &&
                  tip.claimLinkViewed === claimLinkViewed))
          ).length,
          claimLinkViewed,
        }))
        .filter((entry) => entry.count > 0)
    )
  );
  return (
    <Grid.Container css={{ gap: "$2" }}>
      {tipStatusCounts.map((entry) => (
        <Grid key={entry.status + entry.claimLinkViewed}>
          <TipStatusBadge tip={entry} />
        </Grid>
      ))}
    </Grid.Container>
  );
}
