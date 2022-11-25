import { Grid, Loading } from "@nextui-org/react";
import { AdminUserCard } from "components/admin/AdminUserCard";
import { Paginated } from "components/Paginated";
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
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Users</title>
      </Head>
      <h1>Admin/Users</h1>
      <Paginated
        items={adminDashboard.users}
        Render={({ pageItems }) => (
          <Grid.Container justify="center" gap={1}>
            {pageItems.map((user) => (
              <Grid key={user.id} xs={12}>
                <AdminUserCard user={user} />
              </Grid>
            ))}
          </Grid.Container>
        )}
      />
    </>
  );
}

export default AdminUsersPage;
