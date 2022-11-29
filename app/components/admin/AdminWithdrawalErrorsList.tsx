import { Grid, Text } from "@nextui-org/react";
import { AdminWithdrawalErrorCard } from "components/admin/AdminWithdrawalErrorCard";
import { Paginated } from "components/Paginated";
import { AdminExtendedWithdrawalError } from "types/Admin";

type AdminWithdrawalErrorsListProps = {
  withdrawalErrors: AdminExtendedWithdrawalError[];
};

export function AdminWithdrawalErrorsList({
  withdrawalErrors,
}: AdminWithdrawalErrorsListProps) {
  if (!withdrawalErrors.length) {
    return <Text>(No withdrawal errors yet)</Text>;
  }
  return (
    <>
      <Paginated
        items={withdrawalErrors}
        Render={({ pageItems }) => (
          <Grid.Container justify="center" gap={1}>
            {pageItems.map((withdrawalError) => (
              <Grid key={withdrawalError.id} xs={12}>
                <AdminWithdrawalErrorCard withdrawalError={withdrawalError} />
              </Grid>
            ))}
          </Grid.Container>
        )}
      />
    </>
  );
}
