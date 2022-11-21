import { Loading, Row, Spacer, Text } from "@nextui-org/react";
import { AdminJSONDumpCard } from "components/admin/AdminJSONDumpCard";
import { AdminTipsList } from "components/admin/AdminTipsList";
import { AdminUserCard } from "components/admin/AdminUserCard";
import { AdminWithdrawalCard } from "components/admin/AdminWithdrawalCard";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import { AdminExtendedWithdrawal } from "types/Admin";

const AdminWithdrawalPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: withdrawal } = useSWR<AdminExtendedWithdrawal>(
    `/api/admin/withdrawals/${id}`,
    defaultFetcher
  );
  if (!withdrawal) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Withdrawal {id}</title>
      </Head>
      <h1>Admin/Withdrawals</h1>
      <AdminWithdrawalCard withdrawal={withdrawal} />
      <Spacer />
      <Text>
        Amount withdrawn:{" "}
        {withdrawal.tips.length
          ? withdrawal.tips.map((tip) => tip.amount).reduce((a, b) => a + b)
          : 0}{" "}
        sats
      </Text>
      <Text>Outbound routing fee: {withdrawal.routingFee} sats</Text>
      <Text>
        Unspent outbound routing fees:{" "}
        {(withdrawal.tips.length
          ? withdrawal.tips.map((tip) => tip.fee).reduce((a, b) => a + b)
          : 0) - withdrawal.routingFee}{" "}
        sats
      </Text>
      <Spacer />
      <Text h4>Withdrawal</Text>
      <Row>
        <Text>Invoice</Text>
        <Spacer />
        <Text css={{ maxWidth: "300px", wordBreak: "break-all" }}>
          {withdrawal.withdrawalInvoice}
        </Text>
      </Row>
      <Spacer />
      <Text h2>Withdrawn By</Text>
      <AdminUserCard user={withdrawal.user} />
      <Spacer />
      <Text h2>Tips</Text>
      <AdminTipsList tips={withdrawal.tips} />
      <Spacer />
      <AdminJSONDumpCard entity={withdrawal} />
    </>
  );
};

export default AdminWithdrawalPage;
