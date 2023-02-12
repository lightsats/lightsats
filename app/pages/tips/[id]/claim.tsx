import { Collapse, Loading, Spacer, Text } from "@nextui-org/react";
import { Alert } from "components/Alert";
import { ClaimedTipCard } from "components/ClaimedTipCard";
import { HomeButton } from "components/HomeButton";
import { Login } from "components/Login";
import { UnavailableTipActions } from "components/UnavailableTipActions";
import { unclaimedTipStatuses } from "lib/constants";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import { getCurrentUrl, hasTipExpired } from "lib/utils";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { SelectWalletPageContent } from "pages/journey/wallet";
import { Withdraw } from "pages/withdraw";
import React from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { ClaimTipRequest } from "types/ClaimTipRequest";
import { PublicTip } from "types/PublicTip";

const ClaimTipPage: NextPage = () => {
  const { t } = useTranslation("claim");
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { id, printed: isPrinted, walletInstalled } = router.query;
  const { data: publicTip, mutate: mutatePublicTip } = useSWR<PublicTip>(
    id ? `/api/tippee/tips/${id}` : null,
    defaultFetcher
  );
  const isTipper =
    session && publicTip && session.user.id === publicTip.tipperId;

  const [isClaiming, setClaiming] = React.useState(false);

  const destinationRoute = PageRoutes.journeyClaimed;

  React.useEffect(() => {
    if (
      publicTip &&
      publicTip.status === "UNSEEN" &&
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
    publicTip.onboardingFlow !== "SKIP" &&
    publicTip.status === "SEEN" &&
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
      !isClaiming &&
      !hasExpired
    ) {
      router.push(destinationRoute);
    }
  }, [destinationRoute, isClaiming, publicTip, router, session, hasExpired]);

  // tip was already withdrawn by the current user (open old link)
  React.useEffect(() => {
    if (
      session &&
      publicTip &&
      publicTip.status === "WITHDRAWN" &&
      publicTip.tippeeId === session.user.id
    ) {
      router.push(PageRoutes.dashboard);
    }
  }, [publicTip, router, session]);

  // autoclaim after login
  React.useEffect(() => {
    if (canClaim && !isClaiming && router.isReady) {
      setClaiming(true);
      (async () => {
        const claimTipRequest: ClaimTipRequest = {
          isPrinted: isPrinted === "true",
        };
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
  }, [
    canClaim,
    destinationRoute,
    isClaiming,
    id,
    mutatePublicTip,
    router,
    isPrinted,
  ]);

  const isLoading =
    !publicTip ||
    (publicTip.status === "UNSEEN" && !isTipper) ||
    sessionStatus === "loading" ||
    (session && canClaim) ||
    isClaiming;

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Claim tip</title>
      </Head>
      {isLoading ? (
        <>
          <Loading color="currentColor" size="sm" />
        </>
      ) : unclaimedTipStatuses.indexOf(publicTip.status) === -1 &&
        (publicTip.status !== "CLAIMED" ||
          (session && session.user.id !== publicTip.tippeeId)) ? (
        <>
          <Text>This tip is no longer available.</Text>
          <UnavailableTipActions
            skipOnboarding={publicTip.onboardingFlow === "SKIP"}
          />

          <Spacer />
          <HomeButton />
        </>
      ) : publicTip.status === "CLAIMED" && !session ? (
        <>
          <Text>This tip has been claimed but not withdrawn yet.</Text>
          <Spacer />
          <Collapse
            bordered
            title={<Text b>This is my Tip🙋</Text>}
            css={{ width: "100%" }}
          >
            <>
              <Login
                instructionsText={() => "Confirm your account to continue"}
                callbackUrl={getCurrentUrl(router)}
                tipId={publicTip.id}
                defaultLoginMethod="phone"
              />
            </>
          </Collapse>
          <Spacer />
          <Text>Not yours?</Text>
          <Spacer />
          <HomeButton />
        </>
      ) : isTipper ? (
        <>
          <Alert>
            You created this tip.&nbsp;
            <Link href={`${PageRoutes.tips}/${id}`}>Go to Tip</Link>
          </Alert>
          <Spacer />
          <ClaimTipView publicTip={publicTip} isTipper />
        </>
      ) : hasExpired ? (
        <>
          <Spacer y={2} />
          <Text color="error">{t("expired")}</Text>
          <Spacer />
          <HomeButton />
        </>
      ) : (
        <ClaimTipView
          publicTip={publicTip}
          walletInstalled={walletInstalled === "true"}
        />
      )}
    </>
  );
};

export default ClaimTipPage;

type ClaimTipViewProps = {
  publicTip: PublicTip;
  walletInstalled?: boolean;
  isTipper?: boolean;
};

function ClaimTipView({
  publicTip,
  walletInstalled,
  isTipper,
}: ClaimTipViewProps) {
  const { t } = useTranslation("claim");
  const router = useRouter();
  const [selectWalletNextPageHref, setSelectWalletNextPageHref] =
    React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.append("walletInstalled", "true");
    setSelectWalletNextPageHref(url.toString());
  }, []);

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
      <ClaimedTipCard publicTip={publicTip} viewing="tipper" />
      <Spacer y={3} />
      {publicTip.onboardingFlow === "SKIP" ? (
        <Withdraw flow="anonymous" tipId={publicTip.id} isPreview={isTipper} />
      ) : publicTip.onboardingFlow === "LIGHTNING" && !walletInstalled ? (
        <SelectWalletPageContent
          receivedTips={[publicTip]}
          lnurlAuthCapable
          nextUp={t("claim")}
          href={selectWalletNextPageHref}
        />
      ) : (
        <>
          <Login
            instructionsText={(loginMethod) =>
              t(`claim:instructions.${loginMethod}`)
            }
            submitText={t("claim:claim")}
            callbackUrl={getCurrentUrl(router)}
            tipId={publicTip.id}
            defaultLoginMethod={
              publicTip.onboardingFlow === "LIGHTNING" ? "lightning" : "phone"
            }
            allowedLoginMethods={
              publicTip.onboardingFlow === "LIGHTNING"
                ? ["lightning"]
                : undefined
            }
          />
        </>
      )}
      <Spacer />
    </>
  );
}

export { getStaticProps, getStaticPaths };
