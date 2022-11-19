import {
  Button,
  Grid,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { LoginMethodsChart } from "components/admin/LoginMethodsChart";
import { ProfitChart } from "components/admin/ProfitChart";
import { TipsChart } from "components/admin/TipsChart";
import { UserTypesChart } from "components/admin/UserTypesChart";
import { Divider } from "components/Divider";
import { NextLink } from "components/NextLink";
import { NextUIUser } from "components/NextUIUser";
import { differenceInHours } from "date-fns";
import { DEFAULT_NAME } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getUserAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import Head from "next/head";
import toast from "react-hot-toast";
import useSWR from "swr";
import { AdminDashboard } from "types/Admin";

const AdminPage: NextPage = () => {
  const { data: adminDashboard } = useSWR<AdminDashboard>(
    "/api/admin",
    defaultFetcher
  );
  if (!adminDashboard) {
    return <Loading color="currentColor" size="sm" />;
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
  const withdrawnTips = adminDashboard.tips.filter(
    (t) => t.status === "WITHDRAWN"
  );

  const outstandingPaidTips = adminDashboard.tips.filter(
    (t) =>
      t.status !== "UNFUNDED" &&
      t.status !== "WITHDRAWN" &&
      t.status !== "REFUNDED" &&
      t.status !== "UNAVAILABLE"
  );

  const outstandingAmount = outstandingPaidTips.length
    ? outstandingPaidTips.map((t) => t.amount).reduce((a, b) => a + b)
    : 0;
  const outstandingFees = outstandingPaidTips.length
    ? outstandingPaidTips.map((t) => t.fee).reduce((a, b) => a + b)
    : 0;

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
        <Grid xs={12} sm={6}>
          <LoginMethodsChart users={adminDashboard.users} />
        </Grid>
        <Grid xs={12} sm={6}>
          <UserTypesChart users={adminDashboard.users} />
        </Grid>
      </Grid.Container>
      <h6>Admins</h6>
      <Grid.Container justify="center">
        {adminDashboard.adminUsers.map((user) => (
          <Grid key={user.id}>
            <NextUIUser
              name={user.name ?? DEFAULT_NAME}
              src={getUserAvatarUrl(user)}
            />
          </Grid>
        ))}
      </Grid.Container>
      <Spacer />
      <Row justify="center" align="center">
        <Text blockquote>
          <Text color="error">Warning: do not share this link</Text>
          <Link
            onClick={() =>
              window.confirm(
                "Please confirm you are NOT sharing your screen and will not screenshot this page"
              ) && window.open(adminDashboard.lnbitsDashboardUrl, "_blank")
            }
          >
            LNBITS Dashboard
          </Link>
          <Text b>
            Wallet balance: {Math.floor(adminDashboard.walletBalance)} sats
          </Text>
        </Text>
      </Row>
      <Row justify="center">
        <Text
          blockquote
          css={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Text b>
            sms4sats account balance:{" "}
            {Math.floor(adminDashboard.smsForSatsAccountBalance)} sats
          </Text>
          <Button onClick={fundSmsForSatsAccount}>Fund account</Button>
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
        <Text>
          {adminDashboard.withdrawals.length} withdrawals (
          {
            adminDashboard.withdrawals.filter(
              (w) => w.withdrawalFlow === "tippee"
            ).length
          }{" "}
          tippee,{" "}
          {
            adminDashboard.withdrawals.filter(
              (w) => w.withdrawalFlow === "tipper"
            ).length
          }{" "}
          tipper)
        </Text>
      </Row>
      <Row justify="center" align="center">
        <Text>{totalRoutingFees} sats outbound routing fees</Text>
      </Row>
      <Row justify="center" align="center">
        <Text>{profit} sats unspent routing fees (profit)</Text>
      </Row>
      <Row justify="center" align="center">
        <Text>{outstandingAmount} sats outstanding (not yet withdrawn)</Text>
      </Row>
      <Row justify="center" align="center">
        <Text>{outstandingFees} fees outstanding (not yet spent)</Text>
      </Row>
      <Row justify="center" align="center">
        <Text>
          {adminDashboard.users.length} users (
          {adminDashboard.users.filter((user) => !!user.email).length} email,{" "}
          {adminDashboard.users.filter((user) => !!user.phoneNumber).length}{" "}
          phone,{" "}
          {adminDashboard.users.filter((user) => !!user.lnurlPublicKey).length}{" "}
          lnurl-auth)
        </Text>
      </Row>
      <Row justify="center" align="center">
        <Text>
          Average withdrawn tip size:{" "}
          {withdrawnTips.length
            ? Math.floor(
                withdrawnTips.map((tip) => tip.amount).reduce((a, b) => a + b) /
                  withdrawnTips.length
              )
            : 0}{" "}
          sats
        </Text>
      </Row>
      <Row justify="center" align="center">
        <Text>
          Average withdrawn tip expiration duration:{" "}
          {withdrawnTips.length
            ? Math.floor(
                withdrawnTips
                  .map((tip) =>
                    differenceInHours(
                      new Date(tip.expiry),
                      new Date(tip.created)
                    )
                  )
                  .reduce((a, b) => a + b) / withdrawnTips.length
              )
            : 0}{" "}
          hours
        </Text>
      </Row>
      <Row justify="center" align="center">
        <Text>
          Average time to withdrawal:{" "}
          {withdrawnTips.length
            ? Math.floor(
                withdrawnTips
                  .map((tip) =>
                    differenceInHours(
                      new Date(tip.updated), // unreliable unless tip is never updated again after withdrawal
                      new Date(tip.created)
                    )
                  )
                  .reduce((a, b) => a + b) / withdrawnTips.length
              )
            : 0}{" "}
          hours
        </Text>
      </Row>
      <Spacer />
      <Text h4>Browse</Text>
      <Divider />
      <Spacer />
      <Row justify="center" align="center">
        <NextLink href={Routes.adminUsers}>
          <a>
            <Button css={{ bg: "$cyan700" }}>Users</Button>
          </a>
        </NextLink>
        <Spacer />
        <NextLink href={Routes.adminTips}>
          <a>
            <Button css={{ bg: "$purple700" }}>Tips</Button>
          </a>
        </NextLink>
        <Spacer />
        <NextLink href={Routes.adminWithdrawals}>
          <a>
            <Button css={{ bg: "$green700" }}>Withdrawals</Button>
          </a>
        </NextLink>
      </Row>
    </>
  );
};

export default AdminPage;

async function fundSmsForSatsAccount() {
  const promptedAmount = window.prompt("Enter amount in sats", "5000");
  if (!promptedAmount) {
    return;
  }
  const amount = parseInt(promptedAmount);

  const requestHeaders = new Headers();
  requestHeaders.append("Accept", "application/json");
  requestHeaders.append("Content-Type", "application/json");

  const response = await fetch(`/api/admin/sms4sats/fund`, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
      amount,
    }),
  });
  if (response.ok) {
    const invoice = (await response.json()) as string;
    if (window.prompt("Pay the invoice, then click OK to refresh", invoice)) {
      window.location.reload();
    }
  } else {
    toast.error("Failed to fund invoice: " + response.status);
  }
}
