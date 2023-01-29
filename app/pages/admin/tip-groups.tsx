import { Loading } from "@nextui-org/react";
import { AdminTipGroupsList } from "components/admin/AdminTipGroupsList";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import { TipGroupWithTips } from "types/TipGroupWithTips";

const AdminTipGroupsPage: NextPage = () => {
  const { data: tipGroups } = useSWR<TipGroupWithTips[]>(
    "/api/admin/tip-groups",
    defaultFetcher
  );
  if (!tipGroups) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Tip Groups</title>
      </Head>
      <h1>Admin/TipGroups</h1>
      <AdminTipGroupsList tipGroups={tipGroups} />
    </>
  );
};

export default AdminTipGroupsPage;
