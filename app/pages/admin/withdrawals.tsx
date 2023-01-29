import { Loading } from "@nextui-org/react";
import { AdminWithdrawalsList } from "components/admin/AdminWithdrawalsList";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import { AdminExtendedWithdrawal } from "types/Admin";

const AdminWithdrawalsPage: NextPage = () => {
  const { data: withdrawals } = useSWR<AdminExtendedWithdrawal[]>(
    "/api/admin/withdrawals",
    defaultFetcher
  );
  if (!withdrawals) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Withdrawals</title>
      </Head>
      <h1>Admin/Withdrawals</h1>
      <AdminWithdrawalsList withdrawals={withdrawals} />
    </>
  );
};

export default AdminWithdrawalsPage;
