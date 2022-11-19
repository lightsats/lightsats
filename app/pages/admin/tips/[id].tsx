import {
  Badge,
  Card,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { User } from "@prisma/client";
import { AdminJSONDumpCard } from "components/admin/AdminJSONDumpCard";
import { AdminTipCardContents } from "components/admin/AdminTipCardContents";
import { AdminUserCard } from "components/admin/AdminUserCard";
import { AdminWithdrawalCard } from "components/admin/AdminWithdrawalCard";
import { formatDistance } from "date-fns";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import { AdminExtendedTip } from "types/Admin";

const AdminTipPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: tip } = useSWR<AdminExtendedTip>(
    `/api/admin/tips/${id}`,
    defaultFetcher
  );
  if (!tip) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Tip {id}</title>
      </Head>
      <h1>Admin/Tips</h1>
      <Card>
        <Card.Body>
          <AdminTipCardContents tip={tip} />
        </Card.Body>
      </Card>

      <Row justify="center" align="center">
        <Text blockquote>
          {tip.lnbitsWalletUrl ? (
            <>
              <Text color="error">Warning: do not share this link</Text>
              <Link onClick={() => window.open(tip.lnbitsWalletUrl, "_blank")}>
                LNBITS Tip wallet
              </Link>
              <Text b>Balance: {tip.walletBalance} sats</Text>
            </>
          ) : (
            <Text color="error">Tip has not been funded yet</Text>
          )}
        </Text>
      </Row>
      <Spacer />
      <Row>
        <Text>Funding invoice</Text>
        <Spacer />
        <Text css={{ maxWidth: "300px", wordBreak: "break-all" }}>
          {tip.invoice}
        </Text>
      </Row>
      {tip.withdrawal && (
        <>
          <Spacer />
          <Text h2>Withdrawal</Text>
          <AdminWithdrawalCard withdrawal={tip.withdrawal} />
        </>
      )}
      <Spacer />
      <Text h2>Sent Reminders</Text>
      {tip.sentReminders.length ? (
        tip.sentReminders.map((reminder) => (
          <Row
            key={reminder.reminderType}
            align="center"
            justify="space-between"
          >
            <Text b>{reminder.reminderType}</Text>
            <Spacer />
            <Text>
              {formatDistance(new Date(), new Date(reminder.created))} ago
            </Text>
            <Spacer />
            <Badge color={reminder.delivered ? "success" : "error"}>
              {reminder.delivered ? "DELIVERED" : "UNDELIVERED"}
            </Badge>
          </Row>
        ))
      ) : (
        <Text>(No reminders sent yet)</Text>
      )}

      <Spacer />
      <AdminTipUser title="tipper" user={tip.tipper} />
      <Spacer />
      <AdminTipUser title="tippee" user={tip.tippee} />
      <Spacer />
      <AdminJSONDumpCard entity={tip} />
    </>
  );
};

type AdminTipUserProps = {
  title: string;
  user: User | null;
};

function AdminTipUser({ title, user }: AdminTipUserProps) {
  return (
    <>
      <Text h2>{title}</Text>
      {user ? <AdminUserCard user={user} /> : <Text>No tippee yet</Text>}
    </>
  );
}

export default AdminTipPage;
