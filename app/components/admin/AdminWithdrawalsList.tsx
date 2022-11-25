import { Grid, Text } from "@nextui-org/react";
import { AdminWithdrawalCard } from "components/admin/AdminWithdrawalCard";
import { Paginated } from "components/Paginated";
import { AdminExtendedWithdrawal } from "types/Admin";

type AdminWithdrawalsListProps = {
  withdrawals: AdminExtendedWithdrawal[];
};

export function AdminWithdrawalsList({
  withdrawals,
}: AdminWithdrawalsListProps) {
  if (!withdrawals.length) {
    return <Text>(No withdrawals yet)</Text>;
  }
  return (
    <>
      <Paginated
        items={withdrawals}
        Render={({ pageItems }) => (
          <Grid.Container justify="center" gap={1}>
            {pageItems.map((withdrawal) => (
              <Grid key={withdrawal.id} xs={12}>
                <AdminWithdrawalCard withdrawal={withdrawal} />
              </Grid>
            ))}
          </Grid.Container>
        )}
      />
    </>
  );
}
