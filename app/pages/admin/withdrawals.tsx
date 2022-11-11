import { Loading } from "@nextui-org/react";
import { AdminWithdrawalsList } from "components/admin/AdminWithdrawalsList";
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
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Withdrawals</title>
      </Head>
      <h1>Admin/Withdrawals</h1>
      <AdminWithdrawalsList withdrawals={adminDashboard.withdrawals} />
    </>
  );
};

export default AdminWithdrawalsPage;
