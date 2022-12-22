import { Loading } from "@nextui-org/react";
import { AdminTipGroupsList } from "components/admin/AdminTipGroupsList";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import { AdminDashboard } from "types/Admin";

const AdminTipGroupsPage: NextPage = () => {
  const { data: adminDashboard } = useSWR<AdminDashboard>(
    "/api/admin",
    defaultFetcher
  );
  if (!adminDashboard) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Tip Groups</title>
      </Head>
      <h1>Admin/TipGroups</h1>
      <AdminTipGroupsList tipGroups={adminDashboard.tipGroups} />
    </>
  );
};

export default AdminTipGroupsPage;
