import { Avatar, Loading, Row, Spacer, Text } from "@nextui-org/react";
import { BackButton } from "components/BackButton";
import { FiatPrice } from "components/FiatPrice";
import { Login } from "components/Login";
import { formatDistance } from "date-fns";
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
      (!session || session.user.id !== publicTip.tipperId)
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
  }, [id, publicTip, session]);

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
          <BackButton />
        </>
      ) : isTipper ? (
        <>
          <ClaimTipView publicTip={publicTip} />
        </>
      ) : hasExpired ? (
        <>
          <Spacer y={2} />
          <Text color="error">{t("expired")}</Text>
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
          <Text h5>
            {t("hello", {
              tippeeName: publicTip.tippeeName,
            })}
          </Text>
          <Spacer />
        </>
      )}
      <Row justify="center" align="center">
        {publicTip.tipper.name && (
          <>
            <Avatar
              src={getAvatarUrl(
                publicTip.tipper.avatarURL ?? undefined,
                publicTip.tipper.fallbackAvatarId
              )}
              size="md"
              bordered
            />
          </>
        )}
        <Text b size={16}>
          &nbsp;
          {publicTip.tipper.name
            ? t("tipperHasGiftedYou", {
                tipperName: publicTip.tipper.name,
              })
            : t("youHaveBeenGifted")}
        </Text>
      </Row>
      <Spacer y={0.5} />
      <Text h1>
        <FiatPrice
          currency={tipCurrency}
          exchangeRate={exchangeRates?.[tipCurrency]}
          sats={publicTip.amount}
          showApprox={false}
        />
      </Text>
      <Spacer y={-0.75} />
      <Text size={18} b color="$gray">
        {publicTip.amount} sats
      </Text>
      <Spacer />
      <Note note={publicTip.note} />
      <Spacer y={2} />
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
          <Spacer />
          <Row justify="center" align="center">
            <Text small color="error">
              {t("expiresIn", {
                expiry: formatDistance(new Date(publicTip.expiry), Date.now(), {
                  locale: dateFnsLocale,
                }),
              })}
            </Text>
          </Row>
        </>
      }
      <Spacer />
    </>
  );
}

function Note({ note }: { note: string | null }) {
  return note ? (
    <>
      <Row justify="center" align="center">
        💬
        <Spacer x={0.25} />
        <Text i>{note}</Text>
      </Row>
    </>
  ) : null;
}

export { getStaticProps, getStaticPaths };
