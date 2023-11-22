import {
  Button,
  Grid,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Divider } from "components/Divider";
import { NextLink } from "components/NextLink";
import { NextUIUser } from "components/NextUIUser";
import { DEFAULT_NAME } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
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

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin</title>
      </Head>
      <h1>Admin</h1>
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
      <Spacer />
      <Text h4>Browse</Text>
      <Divider />
      <Spacer />
      <Row justify="center" align="center">
        <NextLink href={PageRoutes.adminUsers}>
          <a>
            <Button css={{ bg: "$cyan700" }}>Users</Button>
          </a>
        </NextLink>
        <Spacer />
        <NextLink href={PageRoutes.adminTips}>
          <a>
            <Button css={{ bg: "$purple700" }}>Tips</Button>
          </a>
        </NextLink>
      </Row>
      <Spacer />
      <Row justify="center" align="center">
        <NextLink href={PageRoutes.adminWithdrawals}>
          <a>
            <Button css={{ bg: "$green700" }}>Withdrawals</Button>
          </a>
        </NextLink>
        <Spacer />
        <NextLink href={PageRoutes.adminWithdrawalErrors}>
          <a>
            <Button css={{ bg: "$red700" }}>Withdrawal Errors</Button>
          </a>
        </NextLink>
      </Row>
      <Spacer />
      <Row justify="center" align="center">
        <NextLink href={PageRoutes.adminTipGroups}>
          <a>
            <Button css={{ bg: "$blue700" }}>Tip Groups</Button>
          </a>
        </NextLink>
      </Row>
      {adminDashboard.lnbitsMigrationDate && (
        <>
          <Spacer y={2} />
          <Text h4>LNbits migration</Text>
          <Divider />
          <Spacer />
          <Row justify="center" align="center">
            <NextLink href={PageRoutes.adminLnbitsMigrateUsers}>
              <a>
                <Button css={{ bg: "$cyan700" }}>Users</Button>
              </a>
            </NextLink>
            <Spacer />
            <NextLink href={PageRoutes.adminLnbitsMigrateTips}>
              <a>
                <Button css={{ bg: "$purple700" }}>Tips</Button>
              </a>
            </NextLink>
          </Row>
        </>
      )}
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
