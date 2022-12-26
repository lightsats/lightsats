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
import { LightsatsQRCode } from "components/LightsatsQRCode";
import { NextLink } from "components/NextLink";
import copy from "copy-to-clipboard";
import { getStaticProps } from "lib/i18n/i18next";
import { DEFAULT_LOCALE } from "lib/i18n/locales";
import { CategoryFilterOptions } from "lib/items/getRecommendedItems";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import { signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
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
  const { t } = useTranslation(["common", "login"]);
  const linkExistingAccount = router.query["link"] === "true";
  const [isRedirecting, setRedirecting] = React.useState(false);
  const callbackUrlWithFallback =
    callbackUrl ||
    (router.query["callbackUrl"] as string) ||
    PageRoutes.dashboard;
  // only retrieve the qr code once
  const { data: qr, mutate: fetchNewQR } = useSWRImmutable<LnurlAuthLoginInfo>(
    `/api/auth/lnurl/generate-secret?linkExistingAccount=${linkExistingAccount}`,
    defaultFetcher
  );

  const { data: status } = useSWR<LnurlAuthStatus>(
    qr ? `/api/auth/lnurl/status?k1=${qr.k1}` : null,
    defaultFetcher,
    useLnurlStatusConfig
  );

  React.useEffect(() => {
    if (status?.used && !status.verified && !isRedirecting) {
      toast.error("Generating new QR code");
      fetchNewQR();
    }
  }, [fetchNewQR, isRedirecting, status?.used, status?.verified]);

  React.useEffect(() => {
    if (qr && status?.verified) {
      setRedirecting(true);
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
      toast.success(t("common:copiedToClipboard"));
    }
  }, [qr, t]);

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
              {t("common:lightning")}
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
                    <LightsatsQRCode value={qr.encoded} />
                  </a>
                </NextLink>
              </>
            ) : (
              <>
                <Spacer />
                <Loading>{t("login:generatingQrCode")}</Loading>
              </>
            )}
          </Row>
          <Row justify="center">
            <Text css={{ maxWidth: "250px", ta: "center" }}>
              {t("login:scanQrCode")}
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
                  &nbsp; {t("common:copy")}
                </Button>
                <NextLink href={`lightning:${qr.encoded}`}>
                  <a>
                    <Button>{t("login:clickToConnect")}</Button>
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
            <Collapse title={<Text b>{t("items:compatibleWallets")}</Text>}>
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
