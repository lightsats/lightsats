import {
  Grid,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
  User as NextUser,
} from "@nextui-org/react";
import { ProfitChart } from "components/admin/ProfitChart";
import { TipsChart } from "components/admin/TipsChart";
import { defaultFetcher } from "lib/swr";
import { getUserAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import { AdminDashboard } from "types/Admin";

const AdminPage: NextPage = () => {
  const { data: adminDashboard } = useSWR<AdminDashboard>(
    "/api/admin",
    defaultFetcher
  );
  if (!adminDashboard) {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }
  const totalRoutingFees = adminDashboard.withdrawals.length
    ? adminDashboard.withdrawals
        .map((w) => w.routingFee)
        .reduce((a, b) => a + b)
    : 0;
  const completedTips = adminDashboard.tips.filter(
    (t) => t.status === "WITHDRAWN" || t.status === "REFUNDED"
  );

  const profit =
    (completedTips.length
      ? completedTips.map((t) => t.fee).reduce((a, b) => a + b)
      : 0) - totalRoutingFees;
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin</title>
      </Head>
      <h1>Admin</h1>
      <Grid.Container gap={2}>
        <Grid xs={12} sm={6}>
          <ProfitChart withdrawals={adminDashboard.withdrawals} />
        </Grid>
        <Grid xs={12} sm={6}>
          <TipsChart tips={adminDashboard.tips} />
        </Grid>
      </Grid.Container>
      <h6>Admins</h6>
      <Grid.Container justify="center">
        {adminDashboard.adminUsers.map((user) => (
          <Grid key={user.id}>
            <NextUser name={user.name ?? "Anon"} src={getUserAvatarUrl(user)} />
          </Grid>
        ))}
      </Grid.Container>
      <Spacer />
      <Row justify="center" align="center">
        <Text blockquote>
          <Text color="error">Warning: do not share this link</Text>
          <Link
            onClick={() =>
              window.open(adminDashboard.lnbitsDashboardUrl, "_blank")
            }
          >
            LNBITS Dashboard
          </Link>
        </Text>
      </Row>
      <Row justify="center" align="center">
        <Text>{adminDashboard.tips.length} tips</Text>
      </Row>
      <Row justify="center" align="center">
        <Text>
          {completedTips.length} completed tips (
          {completedTips.filter((t) => t.status === "WITHDRAWN").length}{" "}
          withdrawn,&nbsp;
          {completedTips.filter((t) => t.status === "REFUNDED").length}{" "}
          refunded)
        </Text>
      </Row>
      <Row justify="center" align="center">
        <Text>{adminDashboard.withdrawals.length} withdrawals</Text>
      </Row>
      <Row justify="center" align="center">
        <Text>{totalRoutingFees} sats outbound routing fees</Text>
      </Row>
      <Row justify="center" align="center">
        <Text>{profit} sats unspent routing fees (profit)</Text>
      </Row>
    </>
  );
};

export default AdminPage;
