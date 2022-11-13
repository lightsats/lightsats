import { Link, Loading, Row, Spacer, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { AdminTipsList } from "components/admin/AdminTipsList";
import { NextUIUser } from "components/NextUIUser";
import { DEFAULT_NAME } from "lib/constants";
import { defaultFetcher } from "lib/swr";
import { getUserAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import { AdminExtendedUser } from "types/Admin";

const AdminUserPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: user } = useSWR<AdminExtendedUser>(
    `/api/admin/users/${id}`,
    defaultFetcher
  );
  if (!user) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - User {id}</title>
      </Head>
      <h1>Admin/Users</h1>
      <h6>/{id}</h6>
      <NextUIUser
        name={user.name ?? DEFAULT_NAME}
        src={getUserAvatarUrl(user)}
      />
      <Row justify="center" align="center">
        <Text blockquote>
          {user.lnbitsWalletUrl ? (
            <>
              <Text color="error">Warning: do not share this link</Text>
              <Link onClick={() => window.open(user.lnbitsWalletUrl, "_blank")}>
                LNBITS User wallet
              </Link>
              <Text b>Balance: {user.walletBalance} sats</Text>
            </>
          ) : (
            <Text color="error">User has no staging wallet yet</Text>
          )}
        </Text>
      </Row>
      <Spacer />
      <AdminUserTips title="Tips Sent" tips={user.tipsSent} />
      <Spacer />
      <AdminUserTips title="Tips Received" tips={user.tipsReceived} />
      <Spacer />
      <h2>Withdrawals</h2>
    </>
  );
};

type AdminUserTipsProps = {
  title: string;
  tips: Tip[];
};

function AdminUserTips({ title, tips }: AdminUserTipsProps) {
  return (
    <>
      <Text h2>{title}</Text>
      {tips.length ? <AdminTipsList tips={tips} /> : <Text>No tips yet</Text>}
    </>
  );
}

export default AdminUserPage;
