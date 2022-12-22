import {
  Button,
  Card,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { TipStatus } from "@prisma/client";
import { ConfettiContainer } from "components/ConfettiContainer";
import { NextImage } from "components/NextImage";
import { NextLink } from "components/NextLink";
import { ClaimProgressTracker } from "components/tipper/TipPage/ClaimProgressTracker";
import { PayInvoice } from "components/tipper/TipPage/PayInvoice";
import { ShareUnclaimedTip } from "components/tipper/TipPage/ShareUnclaimedTip";
import { TipPageStatusHeader } from "components/tipper/TipPage/TipPageStatusHeader";
import { useLeaderboardPosition } from "hooks/useLeaderboardPosition";
import { useTip } from "hooks/useTip";
import { expirableTipStatuses, refundableTipStatuses } from "lib/constants";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { PageRoutes } from "lib/PageRoutes";
import { hasTipExpired, nth } from "lib/utils";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";

const TipPage: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [prevTipStatus, setPrevTipStatus] = React.useState<
    TipStatus | undefined
  >();
  const [skipPersonalize, setSkipPersonalize] = React.useState(false);

  const { mutate } = useSWRConfig();
  const mutateTips = React.useCallback(
    () => mutate("/api/tipper/tips"),
    [mutate]
  );

  const { data: tip } = useTip(id as string, true);

  React.useEffect(() => {
    // tipper might have accidentally linked the current page
    // navigate to the claim page
    // TODO: support claiming and managing tip on the same page
    // TODO: add redirect or fallback from the old claim page to this one
    if (sessionStatus === "unauthenticated") {
      router.push(`${PageRoutes.tips}/${id}/claim`);
    }
  }, [id, router, sessionStatus]);

  const tipStatus = tip?.status;

  React.useEffect(() => {
    if (prevTipStatus === "UNFUNDED" && tipStatus === "UNCLAIMED") {
      toast.success("Tip funded");
    }
    setPrevTipStatus(tipStatus);
  }, [prevTipStatus, tipStatus]);

  const hasExpired = tip && hasTipExpired(tip);

  const placing = useLeaderboardPosition(session?.user.id);

  const deleteTip = React.useCallback(() => {
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
  }, [id, mutateTips, router]);

  if (tip) {
    if (
      !skipPersonalize &&
      !hasExpired &&
      expirableTipStatuses.indexOf(tip.status) > -1 &&
      !tip.note
    ) {
      return (
        <>
          {tip.groupId && <TipGroupLink groupId={tip.groupId} />}
          <ClaimProgressTracker tipId={tip.id} />
          <Spacer />
          <Card css={{ dropShadow: "$sm", background: "$primary" }}>
            <Card.Body>
              <Row justify="center">
                <Text h3 css={{ color: "$white", ta: "center" }}>
                  Personalize your tip
                </Text>
              </Row>
              <Row justify="center">
                <NextImage
                  src="/images/icons/personalize.png"
                  width={150}
                  height={150}
                  alt="zap"
                />
              </Row>
              <Row justify="center">
                <Text css={{ textAlign: "center", color: "$white" }}>
                  {
                    "Provide extra details to improve your recipient's onboarding experience"
                  }
                </Text>
              </Row>
              <Spacer />
              <Row justify="center">
                <NextLink href={`${PageRoutes.tips}/${tip.id}/edit`} passHref>
                  <a>
                    <Button size="md" color="secondary">
                      Personalize tip
                    </Button>
                  </a>
                </NextLink>
              </Row>
              <Spacer />
              <Row justify="center">
                <Button light onClick={() => setSkipPersonalize(true)}>
                  <Text color="white" size="small">
                    Skip for now
                  </Text>
                </Button>
              </Row>
            </Card.Body>
          </Card>
        </>
      );
    }
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
            {tip.status === "UNCLAIMED" && <ShareUnclaimedTip tip={tip} />}
          </>
        )}

        {expirableTipStatuses.indexOf(tip.status) > -1 && (
          <>
            <NextLink href={`${PageRoutes.tips}/${tip.id}/edit`} passHref>
              <a>
                <Button>Edit Tip</Button>
              </a>
            </NextLink>
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

export { getStaticProps, getStaticPaths };

function TipGroupLink({ groupId }: { groupId: string }) {
  return (
    <Text blockquote>
      {"This tip is part of a group"}
      <Link href={`${PageRoutes.tipGroups}/${groupId}`}>Go to the group</Link>
    </Text>
  );
}
