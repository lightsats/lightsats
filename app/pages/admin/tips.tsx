import { Loading } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { AdminTipsList } from "components/admin/AdminTipsList";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";

const AdminTipsPage: NextPage = () => {
  const { data: tips } = useSWR<Tip[]>("/api/admin/tips", defaultFetcher);
  if (!tips) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Admin - Tips</title>
      </Head>
      <h1>Admin/Tips</h1>
      <AdminTipsList tips={tips} />
    </>
  );
};

export default AdminTipsPage;
