import { Button, Link, Loading, Row, Spacer, Text } from "@nextui-org/react";
import { Tip, User } from "@prisma/client";
import { AdminJSONDumpCard } from "components/admin/AdminJSONDumpCard";
import { AdminTipGroupsList } from "components/admin/AdminTipGroupsList";
import { AdminTipsList } from "components/admin/AdminTipsList";
import { AdminWithdrawalErrorsList } from "components/admin/AdminWithdrawalErrorsList";
import { AdminWithdrawalsList } from "components/admin/AdminWithdrawalsList";
import { NextUIUser } from "components/NextUIUser";
import { ApiRoutes } from "lib/ApiRoutes";
import { DEFAULT_NAME } from "lib/constants";
import { defaultFetcher } from "lib/swr";
import { getUserAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import useSWR from "swr";
import { AdminExtendedUser, AdminUserChangeEmailRequest } from "types/Admin";

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
      <h2>Tip Groups</h2>
      <AdminTipGroupsList tipGroups={user.tipGroups} />
      <Spacer />

      <h2>Withdrawals</h2>
      <AdminWithdrawalsList withdrawals={user.withdrawals} />
      <Spacer />
      <h2>Withdrawal Errors</h2>
      <AdminWithdrawalErrorsList withdrawalErrors={user.withdrawalErrors} />
      <Spacer />
      <Button color="error" onClick={() => updateUserEmailAddress(user)}>
        Update user email
      </Button>
      <Spacer />
      <AdminJSONDumpCard entity={user} />
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

async function updateUserEmailAddress(user: User) {
  const email = window.prompt("Enter new email address", user.email || "");
  if (email) {
    const changeEmailRequest: AdminUserChangeEmailRequest = {
      email,
    };

    const result = await fetch(
      `${ApiRoutes.adminUsers}/${user.id}/changeEmail`,
      {
        body: JSON.stringify(changeEmailRequest),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!result.ok) {
      toast.error(
        "Failed to change user email: " +
          result.statusText +
          ". Please try again."
      );
    } else {
      toast.success("User email changed to " + email);
      window.location.reload();
    }
  }
}
