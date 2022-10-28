import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  Container,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { BackButton } from "components/BackButton";
import { FiatPrice } from "components/FiatPrice";
import { Icon } from "components/Icon";
import { formatDistance, isAfter } from "date-fns";
import { DEFAULT_FIAT_CURRENCY, expirableTipStatuses } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import EmailSignIn from "pages/auth/signin/email";
import React from "react";
import useSWR from "swr";
import { ClaimTipRequest } from "types/ClaimTipRequest";
import { ExchangeRates } from "types/ExchangeRates";
import { PublicTip } from "types/PublicTip";

const ClaimTipPage: NextPage = () => {
  const router = useRouter();
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

  const destinationRoute = Routes.bitcoin;

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
          alert(
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
      <Container
        justify="center"
        alignItems="center"
        display="flex"
        direction="column"
        css={{ maxWidth: "400px" }}
      >
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
          ) : !session || !canClaim ? (
            <>
              {publicTip.tippeeName && (
                <>
                  <Text h5>
                    Hello
                    {` ${publicTip.tippeeName}`}!
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
                    <Spacer x={0.5} />
                  </>
                )}
                <Text h4>
                  {publicTip.tipper.name
                    ? `${publicTip.tipper.name} has gifted you`
                    : "You've been gifted"}
                </Text>
              </Row>
              <Spacer y={1} />
              <Text h1>
                <FiatPrice
                  currency={tipCurrency}
                  exchangeRate={exchangeRates?.[tipCurrency]}
                  sats={publicTip.amount}
                  showApprox={false}
                />
              </Text>
              <Spacer y={-0.5} />
              <Text b color="gray">
                {publicTip.amount} sats
              </Text>
              <Spacer />
              <Note note={publicTip.note} />
              <Spacer y={2} />
              {hasExpired ? (
                <Text color="error">This tip has expired.</Text>
              ) : (
                <ClaimFundsContainer publicTip={publicTip} />
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
              <Text>Claiming tip</Text>
              <Loading type="spinner" color="currentColor" size="sm" />
            </>
          )
        ) : (
          <>
            <Text>Loading tip</Text>
            <Loading type="spinner" color="currentColor" size="sm" />
          </>
        )}
      </Container>
    </>
  );
};

export default ClaimTipPage;

type ClaimFundsContainerProps = {
  publicTip: PublicTip;
};

function ClaimFundsContainer({ publicTip }: ClaimFundsContainerProps) {
  return (
    <>
      <EmailSignIn
        inline
        callbackUrl={window.location.href}
        submitText="Claim my funds"
      />
      <Spacer y={0.5} />
      <Text>or</Text>
      <Spacer y={0.5} />

      <NextLink
        href={`${Routes.lnurlAuthSignin}?callbackUrl=${encodeURIComponent(
          window.location.href
        )}`}
      >
        <a style={{ width: "100%" }}>
          <Button bordered css={{ width: "100%", background: "white" }}>
            Login with Lightning⚡
          </Button>
        </a>
      </NextLink>
      <Row justify="center" align="center"></Row>
      <Spacer y={0.5} />
      <Row justify="center" align="center">
        <Text small color="error">
          Expires in {formatDistance(new Date(publicTip.expiry), Date.now())}
        </Text>
      </Row>
    </>
  );
}

function Note({ note }: { note: string | null }) {
  return note ? (
    <>
      <Row justify="center" align="center">
        <Icon>
          <ChatBubbleOvalLeftIcon />
        </Icon>
        <Spacer x={0.25} />
        <Text i size="small">
          {note}
        </Text>
      </Row>
    </>
  ) : null;
}
