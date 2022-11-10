import { Button, Loading, Spacer, Text } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { notifyError } from "components/Toasts";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import QRCode from "react-qr-code";
import useSWR, { SWRConfiguration } from "swr";
import useSWRImmutable from "swr/immutable";
import { LnurlAuthLoginInfo } from "types/LnurlAuthLoginInfo";
import { LnurlAuthStatus } from "types/LnurlAuthStatus";

const useLnurlStatusConfig: SWRConfiguration = { refreshInterval: 1000 };

type LnurlAuthSignInProps = {
  callbackUrl?: string;
};

export default function LnurlAuthSignIn({ callbackUrl }: LnurlAuthSignInProps) {
  const router = useRouter();
  const callbackUrlWithFallback =
    callbackUrl || (router.query["callbackUrl"] as string) || Routes.home;
  // only retrieve the qr code once
  const { data: qr } = useSWRImmutable<LnurlAuthLoginInfo>(
    "/api/auth/lnurl/generate-secret",
    defaultFetcher
  );

  const { data: status } = useSWR<LnurlAuthStatus>(
    qr ? `/api/auth/lnurl/status?k1=${qr.k1}` : null,
    defaultFetcher,
    useLnurlStatusConfig
  );

  React.useEffect(() => {
    if (qr && status?.verified) {
      (async () => {
        try {
          const result = await signIn("lnurl", {
            k1: qr.k1,
            callbackUrl: callbackUrlWithFallback,
            redirect: false,
          });

          if (result && result.ok && result.url) {
            router.push(result.url);
          } else {
            throw new Error("Unexpected login result: " + result?.error);
          }
        } catch (error) {
          console.error(error);
          notifyError("login failed");
        }
      })();
    }
  }, [callbackUrlWithFallback, qr, router, status]);

  return (
    <>
      <Spacer />
      <Text h3>Scan or click to sign in</Text>
      {qr ? (
        <>
          <NextLink href={`lightning:${qr.encoded}`}>
            <a>
              <QRCode value={qr.encoded} />
            </a>
          </NextLink>
          <Spacer />
          <NextLink href={`lightning:${qr.encoded}`}>
            <a>
              <Button size="lg">Click to connect</Button>
            </a>
          </NextLink>
        </>
      ) : (
        <>
          <Spacer />
          <Loading type="default" />
          Generating QR code...
        </>
      )}
    </>
  );
}
