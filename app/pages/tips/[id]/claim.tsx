import type { NextPage } from "next";
import { Button, Link, Loading, Spacer, Text } from "@nextui-org/react";
import React from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { defaultFetcher } from "../../../lib/swr";
import { PublicTip } from "../../../types/PublicTip";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import { Routes } from "../../../lib/Routes";
import NextLink from "next/link";
import { ClaimTipRequest } from "../../../types/ClaimTipRequest";

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

  React.useEffect(() => {
    if (canClaim && !hasClaimed) {
      setClaimed(true);
      (async () => {
        try {
          const claimTipRequest: ClaimTipRequest = {};
          const result = await fetch(`/api/tippee/tips/${id}/claim`, {
            method: "POST",
            body: JSON.stringify(claimTipRequest),
            headers: { "Content-Type": "application/json" },
          });
          if (result.ok) {
            // TODO: confetti woohoo particle animation
            router.push(Routes.withdraw);
          } else {
            alert("Failed to create tip: " + result.statusText);
          }
        } catch (error) {
          console.error(error);
          alert("Tip claim failed. Please refresh the page to try again.");
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
          <>
            <Text>This tip has already been gifted.</Text>
            <Spacer />
            <NextLink href={`${Routes.home}`}>
              <a>
                <Link>Back</Link>
              </a>
            </NextLink>
          </>
        ) : !session ? (
          <>
            <Text h3>{"You've been gifted:"}</Text>
            <Text>{publicTip.amount}⚡</Text>
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
          </>
        ) : isTipper ? (
          <>
            <Text>You created this tip so cannot claim it. 😥</Text>
            <Spacer />
            <NextLink href={`${Routes.home}`}>
              <a>
                <Link>Back</Link>
              </a>
            </NextLink>
          </>
        ) : (
          <>
            <Text>{"Claiming tip..."}</Text>
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
