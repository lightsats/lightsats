import {
  Avatar,
  Card,
  Col,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { ExpiryBadge } from "components/ExpiryBadge";
import { FiatPrice } from "components/FiatPrice";
import { HomeButton } from "components/HomeButton";
import { Login } from "components/Login";
import { useDateFnsLocale } from "hooks/useDateFnsLocale";

import { DEFAULT_FIAT_CURRENCY } from "lib/constants";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getAvatarUrl, getCurrentUrl, hasTipExpired } from "lib/utils";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { ClaimTipRequest } from "types/ClaimTipRequest";
import { ExchangeRates } from "types/ExchangeRates";
import { PublicTip } from "types/PublicTip";

const ClaimTipPage: NextPage = () => {
  const { t } = useTranslation("claim");
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { id } = router.query;
  const { data: publicTip, mutate: mutatePublicTip } = useSWR<PublicTip>(
    id ? `/api/tippee/tips/${id}` : null,
    defaultFetcher
  );
  const isTipper =
    session && publicTip && session.user.id === publicTip.tipperId;

  const [isClaiming, setClaiming] = React.useState(false);

  const destinationRoute = Routes.journeyClaimed;

  React.useEffect(() => {
    if (
      publicTip &&
      !publicTip.claimLinkViewed &&
      ((!session && sessionStatus !== "loading") ||
        (session && session.user.id !== publicTip.tipperId))
    ) {
      (async () => {
        const result = await fetch(`/api/tippee/tips/${id}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!result.ok) {
          console.error("Failed to mark tip as viewed: " + result.status);
        }
      })();
    }
  }, [id, publicTip, session, sessionStatus]);

  const hasExpired = publicTip && hasTipExpired(publicTip);

  const canClaim =
    publicTip &&
    publicTip.status === "UNCLAIMED" &&
    session &&
    !isTipper &&
    !hasExpired;

  // tip was already claimed by the current user (open old link)
  React.useEffect(() => {
    if (
      session &&
      publicTip &&
      publicTip.status === "CLAIMED" &&
      publicTip.tippeeId === session.user.id &&
      !isClaiming
    ) {
      router.push(destinationRoute);
    }
  }, [destinationRoute, isClaiming, publicTip, router, session]);

  // autoclaim after login
  React.useEffect(() => {
    if (canClaim && !isClaiming) {
      setClaiming(true);
      (async () => {
        const claimTipRequest: ClaimTipRequest = {};
        const result = await fetch(`/api/tippee/tips/${id}/claim`, {
          method: "POST",
          body: JSON.stringify(claimTipRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (!result.ok) {
          toast.error(
            "Failed to claim tip: " +
              result.statusText +
              ". Please refresh the page to try again."
          );
        } else {
          mutatePublicTip();
          router.push(destinationRoute);
        }
      })();
    }
  }, [canClaim, destinationRoute, isClaiming, id, mutatePublicTip, router]);

  const isLoading =
    !publicTip || sessionStatus === "loading" || canClaim || isClaiming;

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Claim tip</title>
      </Head>
      {isLoading ? (
        <>
          <Loading color="currentColor" size="sm" />
        </>
      ) : publicTip.status !== "UNCLAIMED" ? (
        <>
          <Text>This tip is no longer available.</Text>
          <Spacer />
          <HomeButton />
        </>
      ) : isTipper ? (
        <>
          <ClaimTipView publicTip={publicTip} />
        </>
      ) : hasExpired ? (
        <>
          <Spacer y={2} />
          <Text color="error">{t("expired")}</Text>
          <Spacer />
          <HomeButton />
        </>
      ) : (
        <ClaimTipView publicTip={publicTip} />
      )}
    </>
  );
};

export default ClaimTipPage;

type ClaimTipViewProps = {
  publicTip: PublicTip;
};

function ClaimTipView({ publicTip }: ClaimTipViewProps) {
  const { t } = useTranslation("claim");
  const router = useRouter();
  const dateFnsLocale = useDateFnsLocale(router.locale);

  const { data: exchangeRates } = useSWR<ExchangeRates>(
    `/api/exchange/rates`,
    defaultFetcher
  );
  const tipCurrency = publicTip?.currency ?? DEFAULT_FIAT_CURRENCY;

  return (
    <>
      {publicTip.tippeeName && (
        <>
          <Text h3>
            {t("hello", {
              tippeeName: publicTip.tippeeName,
            })}
          </Text>
        </>
      )}
      <Card
        css={{
          dropShadow: "$sm",
          color: "$white",
          $$cardColor: "$colors$primary",
        }}
      >
        <Card.Body>
          <Row align="center" justify="space-between">
            <Col css={{ dflex: "flex-start", ai: "center" }}>
              <Avatar
                src={getAvatarUrl(
                  publicTip.tipper.avatarURL ?? undefined,
                  publicTip.tipper.fallbackAvatarId
                )}
                size="lg"
                bordered
              />
              &nbsp;
              {publicTip.tipper.name}
            </Col>
            <Col css={{ ta: "right" }}>
              <Text color="$white" b size="$3xl" css={{}}>
                <FiatPrice
                  currency={tipCurrency}
                  exchangeRate={exchangeRates?.[tipCurrency]}
                  sats={publicTip.amount}
                  showApprox={false}
                />
              </Text>
            </Col>
          </Row>
          <Spacer y={0.5} />
          <Row justify="space-between" align="center">
            <ExpiryBadge tip={publicTip} viewing={"tippee"} />
            <Text color="$white" css={{ mt: -15 }}>
              {publicTip.amount} sats
            </Text>
          </Row>
          <Note note={publicTip.note} />
        </Card.Body>
      </Card>
      <Spacer y={3} />
      {
        <>
          <Login
            instructionsText={(loginMethod) =>
              t(`claim:instructions.${loginMethod}`)
            }
            submitText={t("claim:claim")}
            callbackUrl={getCurrentUrl(router)}
            tipId={publicTip.id}
            defaultLoginMethod="phone"
          />
        </>
      }
      <Spacer />
    </>
  );
}

function Note({ note }: { note: string | null }) {
  return note ? (
    <>
      <Spacer y={0.5} />
      <Card
        color="$white"
        css={{
          $$cardColor: "#ffffff66",
          padding: 10,
          mt: 10,
        }}
      >
        <Row justify="center" align="center" css={{}}>
          💬
          <Spacer x={0.25} />
          <Text i>{note}</Text>
        </Row>
      </Card>
    </>
  ) : null;
}

export { getStaticProps, getStaticPaths };
