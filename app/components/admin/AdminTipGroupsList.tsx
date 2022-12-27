import { Grid } from "@nextui-org/react";
import { AdminTipGroupCard } from "components/admin/AdminTipGroupCard";
import { Paginated, PaginatedPageProps } from "components/Paginated";
import { TipGroupWithTips } from "types/TipGroupWithTips";

type AdminTipGroupsListProps = {
  tipGroups: TipGroupWithTips[];
};

export function AdminTipGroupsList({ tipGroups }: AdminTipGroupsListProps) {
  return (
    <>
      <Paginated items={tipGroups} Render={AdminTipGroupsListPage} />
    </>
  );
}

function AdminTipGroupsListPage({
  pageItems,
}: PaginatedPageProps<TipGroupWithTips>) {
  return (
    <Grid.Container justify="center" gap={1}>
      {pageItems.map((tipGroup) => (
        <Grid key={tipGroup.id} xs={12}>
          <AdminTipGroupCard tipGroup={tipGroup} />
        </Grid>
      ))}
    </Grid.Container>
  );
}
