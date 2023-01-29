import { Loading } from "@nextui-org/react";
import { AdminWithdrawalErrorsList } from "components/admin/AdminWithdrawalErrorsList";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import { AdminExtendedWithdrawalError } from "types/Admin";

const AdminWithdrawalsPage: NextPage = () => {
  const { data: withdrawalErrors } = useSWR<AdminExtendedWithdrawalError[]>(
    "/api/admin/errors/withdrawals",
    defaultFetcher
  );
  if (!withdrawalErrors) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Withdrawal Errors</title>
      </Head>
      <h1>Admin/Withdrawal Errors</h1>
      <AdminWithdrawalErrorsList withdrawalErrors={withdrawalErrors} />
    </>
  );
};

export default AdminWithdrawalsPage;
