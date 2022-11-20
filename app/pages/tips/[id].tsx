import { Button, Link, Loading, Spacer, Text } from "@nextui-org/react";
import { TipStatus } from "@prisma/client";
import { ConfettiContainer } from "components/ConfettiContainer";
import { NextLink } from "components/NextLink";
import { ClaimProgressTracker } from "components/tipper/TipPage/ClaimProgressTracker";
import { PayTipInvoice } from "components/tipper/TipPage/PayTipInvoice";
import { ShareUnclaimedTip } from "components/tipper/TipPage/ShareUnclaimedTip";
import { TipPageStatusHeader } from "components/tipper/TipPage/TipPageStatusHeader";
import { useScoreboardPosition } from "hooks/useScoreboardPosition";
import { useTip } from "hooks/useTip";
import { refundableTipStatuses } from "lib/constants";
import { Routes } from "lib/Routes";
import { hasTipExpired, nth } from "lib/utils";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import { requestProvider } from "webln";

const TipPage: NextPage = () => {
  const { data: session } = useSession();
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

  const tipStatus = tip?.status;
  const tipInvoice = tip?.invoice;

  React.useEffect(() => {
    if (prevTipStatus === "UNFUNDED" && tipStatus === "UNCLAIMED") {
      toast.success("Tip funded");
    }
    setPrevTipStatus(tipStatus);
  }, [prevTipStatus, tipStatus]);

  const hasExpired = tip && hasTipExpired(tip);

  React.useEffect(() => {
    if (tipStatus === "UNFUNDED" && !hasExpired && tipInvoice) {
      (async () => {
        try {
          console.log("Launching webln");
          const webln = await requestProvider();
          webln.sendPayment(tipInvoice);
        } catch (error) {
          console.error("Failed to load webln", error);
        }
      })();
    }
  }, [tipStatus, tipInvoice, hasExpired]);

  const placing = useScoreboardPosition(session?.user.id);

  const deleteTip = React.useCallback(() => {
    (async () => {
      router.push(Routes.home);
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
    (async () => {
      router.push(Routes.home);
      const result = await fetch(`/api/tipper/tips/${id}/reclaim`, {
        method: "POST",
      });
      if (!result.ok) {
        toast.error("Failed to reclaim tip: " + result.statusText);
      } else {
        mutateTips();
      }
    })();
  }, [id, mutateTips, router]);

  if (tip) {
    return (
      <>
        {!hasExpired ? (
          <>
            <TipPageStatusHeader status={tip.status} />
          </>
        ) : (
          <>
            <Text h2>Oh no, this tip has expired 😔</Text>
          </>
        )}
        <Spacer />
        <ClaimProgressTracker tipId={tip.id} />
        <Spacer />
        {!hasExpired && (
          <>
            {tip.status === "UNFUNDED" && tip.invoice && (
              <PayTipInvoice invoice={tip.invoice} />
            )}
            {tip.status === "UNCLAIMED" && <ShareUnclaimedTip tip={tip} />}
          </>
        )}
        {tip.status === "WITHDRAWN" && (
          <>
            <ConfettiContainer />
            <Spacer />
            <Text blockquote>
              Rumors say - those who gift bitcoin are a very special kind of
              people.
            </Text>
            <Spacer />
            {placing ? (
              <>
                <Text b>
                  {"You're"} now at&nbsp;
                  <Text
                    color="success"
                    b
                    size="large"
                    style={{ display: "inline" }}
                  >
                    {placing}
                    {nth(placing)}
                  </Text>
                  &nbsp; place on the{" "}
                  <NextLink href={Routes.scoreboard} passHref>
                    <Link style={{ display: "inline" }}>scoreboard</Link>
                  </NextLink>
                  !
                </Text>
                <Spacer />
              </>
            ) : (
              <Loading color="currentColor" size="sm" />
            )}
            <Spacer />
            <NextLink href={Routes.newTip} passHref>
              <a>
                <Button>Create another tip</Button>
              </a>
            </NextLink>
            <Spacer />
          </>
        )}
        {tip.status === "UNFUNDED" && (
          <>
            <Spacer />
            <Button onClick={deleteTip} color="error">
              Delete Tip
            </Button>
          </>
        )}
        {refundableTipStatuses.indexOf(tip.status) >= 0 && (
          <>
            <Spacer />
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
