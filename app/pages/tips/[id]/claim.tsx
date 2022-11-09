import { Avatar, Button, Loading, Row, Spacer, Text } from "@nextui-org/react";
import { BackButton } from "components/BackButton";
import { FiatPrice } from "components/FiatPrice";
import { NextLink } from "components/NextLink";
import { notifyError } from "components/Toasts";
import { isAfter } from "date-fns";
import { useDateFnsLocale } from "hooks/useDateFnsLocale";

import { DEFAULT_FIAT_CURRENCY, expirableTipStatuses } from "lib/constants";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { ClaimTipRequest } from "types/ClaimTipRequest";
import { ExchangeRates } from "types/ExchangeRates";
import { PublicTip } from "types/PublicTip";
import { Login } from "../../../components/Login";

const ClaimTipPage: NextPage = () => {
  const { t } = useTranslation("claim");
  const router = useRouter();
  const dateFnsLocale = useDateFnsLocale(router.locale);
  const { data: session } = useSession();
  const { id } = router.query;
  const { data: publicTip, mutate: mutatePublicTip } = useSWR<PublicTip>(
    id ? `/api/tippee/tips/${id}` : null,
    defaultFetcher
  );
  const isTipper =
    session && publicTip && session.user.id === publicTip.tipperId;

  const [hasClaimed, setClaimed] = React.useState(false);
  const tipCurrency = publicTip?.currency ?? DEFAULT_FIAT_CURRENCY; // TODO: get from tip, TODO: allow tippee to switch currency

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

  const hasExpired =
    publicTip &&
    expirableTipStatuses.indexOf(publicTip.status) >= 0 &&
    isAfter(new Date(), new Date(publicTip.expiry));

  const canClaim =
    publicTip &&
    publicTip.status === "UNCLAIMED" &&
    session &&
    !isTipper &&
    !hasExpired;

  const { data: exchangeRates } = useSWR<ExchangeRates>(
    `/api/exchange/rates`,
    defaultFetcher
  );

  React.useEffect(() => {
    if (canClaim && !hasClaimed) {
      setClaimed(true);
      (async () => {
        const claimTipRequest: ClaimTipRequest = {};
        const result = await fetch(`/api/tippee/tips/${id}/claim`, {
          method: "POST",
          body: JSON.stringify(claimTipRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (!result.ok) {
          notifyError(
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
  }, [canClaim, destinationRoute, hasClaimed, id, mutatePublicTip, router]);

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Claim gift</title>
      </Head>
      {publicTip ? (
        publicTip.hasClaimed ? (
          publicTip.tippeeId === session?.user.id ? (
            <>
              <Text>Tip claimed!</Text>
              <Spacer />
              <NextLink href={destinationRoute}>
                <a>
                  <Button as="a" color="success">
                    Continue
                  </Button>
                </a>
              </NextLink>
            </>
          ) : (
            <>
              <Text>This tip is no longer available.</Text>
              <Spacer />
              <BackButton />
            </>
          )
        ) : !session || canClaim ? (
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
            <Text h1>
              <FiatPrice
                currency={tipCurrency}
                exchangeRate={exchangeRates?.[tipCurrency]}
                sats={publicTip.amount}
                showApprox={false}
              />
            </Text>
            <Spacer y={-0.5} />
            <Text>{publicTip.amount} sats</Text>
            <Spacer />
            <Note note={publicTip.note} />

            {hasExpired ? (
              <>
                <Spacer y={2} />
                <Text color="error">{t("thisTipHasExpired")}</Text>
              </>
            ) : (
              <>
                <Login submitText={t("claim:claim")} />
                <Row justify="center" align="center"></Row>
              </>
            )}
            <Spacer />
          </>
        ) : isTipper ? (
          <>
            <Text>You created this tip so cannot claim it. 😥</Text>
            <Spacer />
            <BackButton />
          </>
        ) : (
          <>
            {/*<Text>Claiming tip</Text>*/}
            <Loading type="spinner" color="currentColor" size="sm" />
          </>
        )
      ) : (
        <>
          {/*<Text>Loading tip</Text>*/}
          <Loading type="spinner" color="currentColor" size="sm" />
        </>
      )}
    </>
  );
};

export default ClaimTipPage;

function Note({ note }: { note: string | null }) {
  return note ? (
    <>
      <Row justify="center" align="center">
        💬
        <Spacer x={0.25} />
        <Text size="small">{note}</Text>
      </Row>
    </>
  ) : null;
}

export { getStaticProps, getStaticPaths };
