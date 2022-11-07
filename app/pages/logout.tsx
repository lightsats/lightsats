import { Loading } from "@nextui-org/react";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import { signOut } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

const Logout: NextPage = () => {
  const router = useRouter();
  React.useEffect(() => {
    signOut({
      redirect: false,
    });
    router.push(Routes.home);
  }, [router]);

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Log out</title>
      </Head>
      <Loading type="spinner" color="currentColor" size="sm" />
    </>
  );
};

export default Logout;
