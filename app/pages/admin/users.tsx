import { Grid, Loading, Spacer } from "@nextui-org/react";
import { AdminUserCard } from "components/admin/AdminUserCard";
import { usePagination } from "hooks/usePagination";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import { AdminDashboard } from "types/Admin";

const AdminUsersPage: NextPage = () => {
  const { data: adminDashboard } = useSWR<AdminDashboard>(
    "/api/admin",
    defaultFetcher
  );

  if (!adminDashboard) {
    return <Loading color="currentColor" size="sm" />;
  }
  return <AdminPageInternal adminDashboard={adminDashboard} />;
};

type AdminPageInternalProps = {
  adminDashboard: AdminDashboard;
};

function AdminPageInternal({ adminDashboard }: AdminPageInternalProps) {
  const { pageItems, paginationComponent } = usePagination(
    adminDashboard.users
  );

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Users</title>
      </Head>
      <h1>Admin/Users</h1>
      {paginationComponent}
      {paginationComponent ? <Spacer /> : undefined}
      <Grid.Container justify="center" gap={1}>
        {pageItems.map((user) => (
          <Grid key={user.id} xs={12}>
            <AdminUserCard user={user} />
          </Grid>
        ))}
      </Grid.Container>
    </>
  );
}

export default AdminUsersPage;
