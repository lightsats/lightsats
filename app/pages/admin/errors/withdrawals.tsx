import { Loading } from "@nextui-org/react";
import { AdminWithdrawalErrorsList } from "components/admin/AdminWithdrawalErrorsList";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import { AdminDashboard } from "types/Admin";

const AdminWithdrawalsPage: NextPage = () => {
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
        <title>Lightsats⚡ - Admin - Withdrawals</title>
      </Head>
      <h1>Admin/Withdrawals</h1>
      <AdminWithdrawalErrorsList
        withdrawalErrors={adminDashboard.withdrawalErrors}
      />
    </>
  );
};

export default AdminWithdrawalsPage;
