import { Card, Link, Loading, Row, Spacer, Text } from "@nextui-org/react";
import { AdminJSONDumpCard } from "components/admin/AdminJSONDumpCard";
import { AdminTipGroupCardContents } from "components/admin/AdminTipGroupCardContents";
import { AdminTipsList } from "components/admin/AdminTipsList";
import { AdminUserCard } from "components/admin/AdminUserCard";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import { AdminExtendedTipGroup } from "types/Admin";

const AdminTipGroupPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: tipGroup } = useSWR<AdminExtendedTipGroup>(
    `/api/admin/tip-groups/${id}`,
    defaultFetcher
  );
  if (!tipGroup) {
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
          <AdminTipGroupCardContents tipGroup={tipGroup} />
        </Card.Body>
      </Card>

      <Row justify="center" align="center">
        <Text blockquote>
          {tipGroup.lnbitsWalletUrl ? (
            <>
              <Text color="error">Warning: do not share this link</Text>
              <Link
                onClick={() => window.open(tipGroup.lnbitsWalletUrl, "_blank")}
              >
                LNBITS Tip wallet
              </Link>
              <Text b>Balance: {tipGroup.walletBalance} sats</Text>
            </>
          ) : (
            <Text color="error">Tip group has not been funded yet</Text>
          )}
        </Text>
      </Row>
      <Spacer />
      <Row>
        <Text>Funding invoice</Text>
        <Spacer />
        <Text css={{ maxWidth: "300px", wordBreak: "break-all" }}>
          {tipGroup.invoice}
        </Text>
      </Row>

      <Spacer />
      <Text h2>Tipper</Text>
      <AdminUserCard user={tipGroup.tipper} />

      <Spacer />
      <Text h2>Tips</Text>
      <AdminTipsList tips={tipGroup.tips} />

      <Spacer />
      <AdminJSONDumpCard entity={tipGroup} />
    </>
  );
};

export default AdminTipGroupPage;
