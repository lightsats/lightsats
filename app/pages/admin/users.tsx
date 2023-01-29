import { Grid, Loading } from "@nextui-org/react";
import { User } from "@prisma/client";
import { AdminUserCard } from "components/admin/AdminUserCard";
import { Paginated } from "components/Paginated";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";

const AdminUsersPage: NextPage = () => {
  const { data: adminDashboard } = useSWR<User[]>(
    "/api/admin/users",
    defaultFetcher
  );

  if (!adminDashboard) {
    return <Loading color="currentColor" size="sm" />;
  }
  return <AdminPageInternal users={adminDashboard} />;
};

type AdminPageInternalProps = {
  users: User[];
};

function AdminPageInternal({ users }: AdminPageInternalProps) {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Users</title>
      </Head>
      <h1>Admin/Users</h1>
      <Paginated
        items={users}
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
