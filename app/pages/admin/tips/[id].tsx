import { Link, Loading, Row, Spacer, Text } from "@nextui-org/react";
import { User } from "@prisma/client";
import { AdminUserCard } from "components/admin/AdminUserCard";
import { AdminWithdrawalCard } from "components/admin/AdminWithdrawalCard";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
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
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Tip {id}</title>
      </Head>
      <h1>Admin/Tips</h1>
      <h6>/{id}</h6>

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
      <Row justify="space-between">
        <Text b>{tip.id}</Text>

        <TipStatusBadge status={tip.status} />
      </Row>
      <Row justify="space-between">
        <Text>{formatDistance(new Date(), new Date(tip.created))} ago</Text>
        <Text>
          {tip.amount}⚡ ({tip.fee} sats fee)
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
      <AdminTipUser title="tipper" user={tip.tipper} />
      <Spacer />
      <AdminTipUser title="tippee" user={tip.tippee} />
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
