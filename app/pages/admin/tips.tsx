import { Loading } from "@nextui-org/react";
import { AdminTipsList } from "components/admin/AdminTipsList";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import { AdminDashboard } from "types/Admin";

const AdminTipsPage: NextPage = () => {
  const { data: adminDashboard } = useSWR<AdminDashboard>(
    "/api/admin",
    defaultFetcher
  );
  if (!adminDashboard) {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Tips</title>
      </Head>
      <h1>Admin/Tips</h1>
      <AdminTipsList tips={adminDashboard.tips} />
    </>
  );
};

export default AdminTipsPage;
