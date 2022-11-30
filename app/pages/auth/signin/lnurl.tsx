import { ClipboardIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Collapse,
  Divider,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Icon } from "components/Icon";
import { ItemsList } from "components/items/ItemsList";
import { NextLink } from "components/NextLink";
import copy from "copy-to-clipboard";
import { getStaticProps } from "lib/i18n/i18next";
import { DEFAULT_LOCALE } from "lib/i18n/locales";
import { CategoryFilterOptions } from "lib/items/getRecommendedItems";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
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
  const { t } = useTranslation("common");
  const linkExistingAccount = router.query["link"] === "true";
  const callbackUrlWithFallback =
    callbackUrl || (router.query["callbackUrl"] as string) || Routes.dashboard;
  // only retrieve the qr code once
  const { data: qr } = useSWRImmutable<LnurlAuthLoginInfo>(
    `/api/auth/lnurl/generate-secret?linkExistingAccount=${linkExistingAccount}`,
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
            locale: router.locale || DEFAULT_LOCALE,
            redirect: false,
          });

          if (result && result.ok && result.url) {
            router.push(result.url);
          } else {
            throw new Error("Unexpected login result: " + result?.error);
          }
        } catch (error) {
          console.error(error);
          toast.error("login failed");
        }
      })();
    }
  }, [callbackUrlWithFallback, qr, router, status]);

  const copyQr = React.useCallback(() => {
    if (qr) {
      copy(qr.encoded);
      toast.success("Copied to clipboard");
    }
  }, [qr]);

  const categoryFilterOptions: CategoryFilterOptions = React.useMemo(
    () => ({ lnurlAuthCapable: true, filterOtherItems: true, shadow: false }),
    []
  );

  return (
    <>
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Header>
          <Row justify="center" align="center">
            <Text h4 css={{ fontWeight: "bold", m: 0 }}>
              {t("lightning")}
            </Text>
            <Spacer x={0.5} /> {/* shift Lightning into center */}
          </Row>
        </Card.Header>
        <Divider />
        <Card.Body>
          <Spacer y={0.5} />
          <Row justify="center">
            {qr ? (
              <>
                <NextLink href={`lightning:${qr.encoded}`}>
                  <a>
                    <QRCode value={qr.encoded} />
                  </a>
                </NextLink>
              </>
            ) : (
              <>
                <Spacer />
                <Loading>Generating QR code...</Loading>
              </>
            )}
          </Row>
          <Row justify="center">
            <Text css={{ maxWidth: "250px", ta: "center" }}>
              {
                "Scan this code or copy + paste it to your lightning wallet. Or click to login with your browser's wallet."
              }
            </Text>
          </Row>
        </Card.Body>
        {qr && (
          <>
            <Card.Divider />
            <Card.Footer>
              <Row justify="space-between">
                <Button onClick={copyQr} auto color="secondary">
                  <Icon>
                    <ClipboardIcon />
                  </Icon>
                  &nbsp; Copy
                </Button>
                <NextLink href={`lightning:${qr.encoded}`}>
                  <a>
                    <Button>Click to connect</Button>
                  </a>
                </NextLink>
              </Row>
            </Card.Footer>
          </>
        )}
      </Card>
      <Spacer />
      <Card variant="flat">
        <Card.Body css={{ p: 0 }}>
          <Collapse.Group>
            <Collapse title={<Text b>Compatible Wallets</Text>}>
              <ItemsList category="wallets" options={categoryFilterOptions} />
            </Collapse>
          </Collapse.Group>
        </Card.Body>
      </Card>
      <Spacer />
    </>
  );
}

export { getStaticProps };
