import {
  Col,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
  User as NextUser,
} from "@nextui-org/react";
import { defaultFetcher } from "lib/swr";
import { getUserAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
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

  const withdrawnTipFees = completedTips.length
    ? completedTips.map((t) => t.fee).reduce((a, b) => a + b)
    : 0;
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin</title>
      </Head>
      <h1>Admin</h1>
      <>
        <h6>Admins</h6>
        <Row justify="center" align="center">
          {adminDashboard.adminUsers.map((user) => (
            <Col key={user.id}>
              <NextUser
                name={user.name ?? "Anon"}
                src={getUserAvatarUrl(user)}
              />
            </Col>
          ))}
        </Row>
        <Spacer />
        <Row justify="center" align="center">
          <Text blockquote>
            <Text color="error">Warning: do not share this link</Text>
            <NextLink href={adminDashboard.lnbitsDashboardUrl} passHref>
              <Link target="_blank">LNBITS Dashboard</Link>
            </NextLink>
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
          <Text>{withdrawnTipFees} sats unspent routing fees (profit)</Text>
        </Row>
      </>
    </>
  );
};

export default AdminPage;
