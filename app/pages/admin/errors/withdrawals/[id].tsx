import { Loading, Spacer, Text } from "@nextui-org/react";
import { AdminJSONDumpCard } from "components/admin/AdminJSONDumpCard";
import { AdminUserCard } from "components/admin/AdminUserCard";
import { AdminWithdrawalErrorCard } from "components/admin/AdminWithdrawalErrorCard";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import { AdminExtendedWithdrawalError } from "types/Admin";

const AdminWithdrawalErrorPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: withdrawalError } = useSWR<AdminExtendedWithdrawalError>(
    `/api/admin/errors/withdrawals/${id}`,
    defaultFetcher
  );
  if (!withdrawalError) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Withdrawal {id}</title>
      </Head>
      <h1>Admin/Withdrawals</h1>
      <AdminWithdrawalErrorCard withdrawalError={withdrawalError} />
      <Spacer />
      <Text h2>User</Text>
      <AdminUserCard user={withdrawalError.user} />
      <Spacer />
      <AdminJSONDumpCard entity={withdrawalError} />
    </>
  );
};

export default AdminWithdrawalErrorPage;
