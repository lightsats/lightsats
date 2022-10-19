import { Button, Loading, Spacer, Text } from "@nextui-org/react";
import { BackButton } from "components/BackButton";
import { FiatPrice } from "components/FiatPrice";
import { DEFAULT_FIAT_CURRENCY } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { fixNextUIButtonLink } from "lib/utils";
import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { ClaimTipRequest } from "types/ClaimTipRequest";
import { ExchangeRates } from "types/ExchangeRates";
import { PublicTip } from "types/PublicTip";

const ClaimTipPage: NextPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  const { data: publicTip } = useSWR<PublicTip>(
    id ? `/api/tippee/tips/${id}` : null,
    defaultFetcher
  );
  const isTipper =
    session && publicTip && session.user.id === publicTip.tipperId;
  const canClaim = publicTip && !publicTip.hasClaimed && session && !isTipper;
  const [hasClaimed, setClaimed] = React.useState(false);
  const tipCurrency = publicTip?.currency ?? DEFAULT_FIAT_CURRENCY; // TODO: get from tip, TODO: allow tippee to switch currency

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
        }
      })();
    }
  }, [canClaim, hasClaimed, id, router]);

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
              <NextLink href={Routes.withdraw} passHref>
                <Button as="a" color="success" onClick={fixNextUIButtonLink}>
                  Withdraw
                </Button>
              </NextLink>
              <Spacer />
              <Note note={publicTip.note} />
            </>
          ) : (
            <>
              <Text>This tip has already been gifted.</Text>
              <Spacer />
              <BackButton />
            </>
          )
        ) : !session ? (
          <>
            <Text h3>{"You've been gifted:"}</Text>
            <Text h1>
              <FiatPrice
                currency={tipCurrency}
                exchangeRate={exchangeRates?.[tipCurrency]}
                sats={publicTip.amount}
              />
            </Text>
            <Text>{publicTip.amount} satoshis⚡</Text>
            <Spacer />
            <Button
              onClick={() =>
                signIn("email", {
                  callbackUrl:
                    window.location
                      .href /* redirect back to same page on login */,
                })
              }
            >
              Claim my funds
            </Button>
            <Spacer />
            <Note note={publicTip.note} />
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
    </>
  );
};

export default ClaimTipPage;

function Note({ note }: { note: string | null }) {
  return note ? (
    <>
      <Text>You were sent a note:</Text>
      <Text>{note}</Text>
    </>
  ) : null;
}
