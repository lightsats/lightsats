import { Loading, Spacer } from "@nextui-org/react";
import { HomeButton } from "components/HomeButton";
import { UnavailableTipActions } from "components/UnavailableTipActions";
import { ApiRoutes } from "lib/ApiRoutes";
import { defaultFetcher } from "lib/swr";
import { getClaimUrl } from "lib/utils";
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

  React.useEffect(() => {
    if (staticTipRedirect?.tipId) {
      router.replace(
        getClaimUrl({
          id: staticTipRedirect.tipId,
          tippeeLocale: staticTipRedirect.tippeeLocale,
        })
      );
    }
  }, [router, staticTipRedirect]);

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
