import { Button, Link, Loading, Spacer, Text } from "@nextui-org/react";
import { TipStatus } from "@prisma/client";
import { ConfettiContainer } from "components/ConfettiContainer";
import { NextLink } from "components/NextLink";
import { PersonalizeTip } from "components/tipper/PersonalizeTip";
import { ClaimProgressTracker } from "components/tipper/TipPage/ClaimProgressTracker";
import { PayInvoice } from "components/tipper/TipPage/PayInvoice";
import { ShareUnclaimedTip } from "components/tipper/TipPage/ShareUnclaimedTip";
import { TipPageStatusHeader } from "components/tipper/TipPage/TipPageStatusHeader";
import { useLeaderboardPosition } from "hooks/useLeaderboardPosition";
import { useTip } from "hooks/useTip";
import {
  expirableTipStatuses,
  refundableTipStatuses,
  unclaimedTipStatuses,
} from "lib/constants";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import { hasTipExpired, nth } from "lib/utils";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import useSWR, { useSWRConfig } from "swr";
import { PublicTip } from "types/PublicTip";

const TipPage: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [prevTipStatus, setPrevTipStatus] = React.useState<
    TipStatus | undefined
  >();

  const { mutate } = useSWRConfig();
  const mutateTips = React.useCallback(
    () => mutate("/api/tipper/tips"),
    [mutate]
  );

  const { data: tip } = useTip(id as string, true);
  const { data: publicTip } = useSWR<PublicTip>(
    `/api/tippee/tips/${id}`,
    defaultFetcher
  );
  const tipperId = publicTip?.tipperId;

  React.useEffect(() => {
    // tipper might have accidentally linked the current page
    // navigate to the claim page
    // TODO: support claiming and managing tip on the same page
    // TODO: add redirect or fallback from the old claim page to this one
    if (
      sessionStatus === "unauthenticated" ||
      (tipperId && session && session.user.id !== tipperId)
    ) {
      router.push(`${PageRoutes.tips}/${id}/claim`);
    }
  }, [id, router, session, sessionStatus, tipperId]);

  const tipStatus = tip?.status;

  React.useEffect(() => {
    if (prevTipStatus === "UNFUNDED" && tipStatus === "UNSEEN") {
      toast.success("Tip funded");
    }
    setPrevTipStatus(tipStatus);
  }, [prevTipStatus, tipStatus]);

  const hasExpired = tip && hasTipExpired(tip);

  const placing = useLeaderboardPosition(session?.user.id);

  const deleteTip = React.useCallback(() => {
    if (
      !window.confirm(
        "Are you sure you want to delete this tip? any sats sent to it cannot be recovered"
      )
    ) {
      return;
    }
    (async () => {
      router.push(PageRoutes.dashboard);
      const result = await fetch(`/api/tipper/tips/${id}`, {
        method: "DELETE",
      });
      if (!result.ok) {
        toast.error("Failed to delete tip: " + result.statusText);
      } else {
        mutateTips();
      }
    })();
  }, [id, router, mutateTips]);

  const reclaimTip = React.useCallback(() => {
    if (!tip?.type || tip.type === "NON_CUSTODIAL_NWC") {
      window.alert(
        "non-custodial tips cannot be reclaimed. Please manually remove the NWC connection."
      );
      return;
    }
    if (
      hasExpired ||
      window.confirm(
        "Are you sure you wish to reclaim your tip? your recipient won't be able to withdraw their sats."
      )
    ) {
      (async () => {
        router.push(PageRoutes.dashboard);
        const result = await fetch(`/api/tipper/tips/${id}/reclaim`, {
          method: "POST",
        });
        if (!result.ok) {
          toast.error("Failed to reclaim tip: " + result.statusText);
        } else {
          mutateTips();
        }
      })();
    }
  }, [hasExpired, id, mutateTips, router, tip?.type]);

  if (tip) {
    return (
      <>
        {tip.groupId && <TipGroupLink groupId={tip.groupId} />}
        {!hasExpired ? (
          <>
            <TipPageStatusHeader status={tip.status} />
          </>
        ) : (
          <>
            <Text h3>Oh no, this tip has expired 😔</Text>
          </>
        )}
        <Spacer />
        <ClaimProgressTracker tipId={tip.id} />
        <Spacer />
        {!hasExpired && (
          <>
            {tip.status === "UNFUNDED" && tip.invoice && (
              <>
                <PayInvoice invoice={tip.invoice} variant="tip" />
                <Spacer />
              </>
            )}
            {tip.status === "UNFUNDED" && tip.groupId && (
              <>
                <Text blockquote>
                  {"This tip is part of a group which hasn't been funded yet."}
                </Text>
                <Spacer />
              </>
            )}
            {unclaimedTipStatuses.indexOf(tip.status) > -1 && (
              <ShareUnclaimedTip tip={tip} />
            )}
          </>
        )}

        {expirableTipStatuses.indexOf(tip.status) > -1 && (
          <>
            <PersonalizeTip href={`${PageRoutes.tips}/${tip.id}/edit`} />
            <Spacer />
          </>
        )}

        {tip.status === "WITHDRAWN" && (
          <>
            <ConfettiContainer />
            <Text
              blockquote
              css={{
                background: "$primary",
                color: "$white",
                ta: "center",
                fontStyle: "italic",
              }}
            >
              Rumors say - those who gift bitcoin are a very special kind of
              people.
            </Text>
            <Spacer />
            {placing ? (
              <>
                <Text b css={{ ta: "center" }}>
                  {"You're"} now at&nbsp;
                  <Text
                    color="primary"
                    b
                    size="large"
                    style={{ display: "inline" }}
                  >
                    {placing}
                    {nth(placing)}
                  </Text>
                  &nbsp; place on the{" "}
                  <NextLink href={PageRoutes.leaderboard} passHref>
                    <Link style={{ display: "inline" }}>leaderboard</Link>
                  </NextLink>
                  !
                </Text>
                <Spacer />
              </>
            ) : (
              <Loading color="currentColor" size="sm" />
            )}
            <Spacer />
            <NextLink href={PageRoutes.newTip} passHref>
              <a>
                <Button>Create another tip</Button>
              </a>
            </NextLink>
            <Spacer />
          </>
        )}
        {tip.status === "UNFUNDED" && (
          <>
            <Button onClick={deleteTip} color="error">
              Delete Tip
            </Button>
          </>
        )}
        {refundableTipStatuses.indexOf(tip.status) >= 0 && (
          <>
            <Button onClick={reclaimTip} color="error">
              Reclaim tip
            </Button>
          </>
        )}
      </>
    );
  } else {
    return (
      <>
        <Spacer y={4} />
        <Loading color="currentColor" size="lg">
          Loading...
        </Loading>
      </>
    );
  }
};

export default TipPage;

export { getStaticPaths, getStaticProps };

function TipGroupLink({ groupId }: { groupId: string }) {
  return (
    <Text blockquote>
      {"This tip is part of a group."}&nbsp;
      <Link href={`${PageRoutes.tipGroups}/${groupId}`}>Open</Link>
    </Text>
  );
}
