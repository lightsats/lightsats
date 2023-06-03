import { Loading, Spacer } from "@nextui-org/react";
import { HomeButton } from "components/HomeButton";
import { UnavailableTipActions } from "components/UnavailableTipActions";
import { ApiRoutes } from "lib/ApiRoutes";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { StaticTipRedirect } from "types/StaticTipRedirect";

const StaticTipGroupPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: staticTipRedirect } = useSWR<StaticTipRedirect>(
    id ? `${ApiRoutes.tipGroups}/${id}/static` : undefined,
    defaultFetcher
  );

  const tipId = staticTipRedirect?.tipId;
  React.useEffect(() => {
    if (tipId) {
      router.replace(`${PageRoutes.tips}/${tipId}/claim`);
    }
  }, [router, tipId]);

  if (!staticTipRedirect || staticTipRedirect.tipId) {
    return <Loading color="currentColor" size="lg" />;
  }

  return (
    <>
      <p>Sorry, this tip is no longer available.</p>
      <UnavailableTipActions />
      <Spacer />
      <HomeButton />
    </>
  );
};

export default StaticTipGroupPage;
