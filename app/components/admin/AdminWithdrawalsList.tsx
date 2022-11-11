import { Grid, Spacer } from "@nextui-org/react";
import { Withdrawal } from "@prisma/client";
import { AdminWithdrawalCard } from "components/admin/AdminWithdrawalCard";
import { usePagination } from "hooks/usePagination";

type AdminWithdrawalsListProps = {
  withdrawals: Withdrawal[];
};

export function AdminWithdrawalsList({
  withdrawals,
}: AdminWithdrawalsListProps) {
  const { pageItems, paginationComponent } = usePagination(withdrawals);

  return (
    <>
      {paginationComponent}
      {paginationComponent ? <Spacer /> : undefined}
      <Grid.Container justify="center" gap={1}>
        {pageItems.map((withdrawal) => (
          <Grid key={withdrawal.id} xs={12}>
            <AdminWithdrawalCard withdrawal={withdrawal} />
          </Grid>
        ))}
      </Grid.Container>
    </>
  );
}
