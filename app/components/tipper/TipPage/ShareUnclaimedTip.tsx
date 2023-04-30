import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Col,
  Input,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
  Tooltip,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { webln } from "alby-js-sdk";
import { Icon } from "components/Icon";
import { LightningQRCode } from "components/LightningQRCode";
import { NextLink } from "components/NextLink";
import { Passphrase } from "components/tipper/Passphrase";
import copy from "copy-to-clipboard";
import { ApiRoutes } from "lib/ApiRoutes";
import { PageRoutes } from "lib/PageRoutes";
import {
  getClaimUrl,
  getDefaultGiftCardTheme,
  getRedeemUrl,
  isValidNostrConnectUrl,
  tryGetErrorMessage,
} from "lib/utils";
import React from "react";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import { GiftCardTheme } from "types/GiftCardTheme";
import { LnurlWithdrawalRequest } from "types/LnurlWithdrawalRequest";

type ShareUnclaimedTipProps = {
  tip: Tip;
};

export function ShareUnclaimedTip({ tip }: ShareUnclaimedTipProps) {
  const [mode, setMode] = React.useState<"QR" | "lnurl" | "passphrase">("QR");
  const [isGeneratingPassphrase, setGeneratingPassphrase] =
    React.useState(false);
  const [nwcConnectionString, setNwcConnectionString] = React.useState<
    string | undefined
  >();
  const claimUrl = getClaimUrl(tip, undefined, nwcConnectionString);
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string | undefined>();
  React.useEffect(() => {
    if (mode === "QR") {
      setQrCodeUrl(claimUrl);
    } else if (mode === "lnurl") {
      setQrCodeUrl(undefined);
      (async () => {
        const withdrawalRequest: LnurlWithdrawalRequest = {
          amount: tip.amount,
          flow: "anonymous",
          tipId: tip.id,
        };
        const result = await fetch("/api/withdrawalLinks", {
          method: "POST",
          body: JSON.stringify(withdrawalRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          setQrCodeUrl(await result.json());
        } else {
          const body = await result.text();
          toast.error(
            "Failed to create withdraw link: " + result.statusText + `\n${body}`
          );
        }
      })();
    }
  }, [claimUrl, mode, tip.amount, tip.id]);

  const generatePassphrase = React.useCallback(() => {
    (async () => {
      setGeneratingPassphrase(true);
      const result = await fetch(
        `${ApiRoutes.tipperTips}/${tip.id}/generatePassphrase`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!result.ok) {
        toast.error(
          "Failed to generate passphrase: " + (await tryGetErrorMessage(result))
        );
        setGeneratingPassphrase(false);
      }
    })();
  }, [tip.id]);

  const linkWallet = React.useCallback(async () => {
    const nwc = webln.NostrWebLNProvider.withNewSecret(
      process.env.NEXT_PUBLIC_NWC_WALLET_PUBKEY &&
        process.env.NEXT_PUBLIC_NWC_AUTHORIZATION_URL
        ? {
            walletPubkey: process.env.NEXT_PUBLIC_NWC_WALLET_PUBKEY,
            authorizationUrl: process.env.NEXT_PUBLIC_NWC_AUTHORIZATION_URL,
          }
        : undefined
    );
    await nwc.initNWC({
      name: `Lightsats Tip ${tip.id}`,
    });

    setNwcConnectionString(nwc.getNostrWalletConnectUrl(true));
  }, [tip.id]);

  React.useEffect(() => {
    if (isGeneratingPassphrase && tip.passphrase) {
      setGeneratingPassphrase(false);
    }
  }, [isGeneratingPassphrase, tip]);

  const copyQRCodeUrl = React.useCallback(() => {
    if (qrCodeUrl) {
      copy(qrCodeUrl);
      toast.success("Copied to clipboard");
    }
  }, [qrCodeUrl]);

  return (
    <>
      <Row justify="center">
        <Button
          size="xs"
          auto
          css={{
            width: "60px",
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
          bordered={mode !== "QR"}
          onClick={() => setMode("QR")}
        >
          QR code
        </Button>
        {tip.onboardingFlow === "SKIP" && tip.type === "CUSTODIAL" && (
          <Button
            size="xs"
            auto
            css={{
              width: "60px",
              borderRadius: 0,
              borderLeft: "none",
              borderRight: "none",
            }}
            bordered={mode !== "lnurl"}
            onClick={() => setMode("lnurl")}
          >
            LNURL
          </Button>
        )}
        <Button
          size="xs"
          auto
          css={{
            width: "60px",
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
          bordered={mode !== "passphrase"}
          onClick={() => setMode("passphrase")}
        >
          Redeem
        </Button>
      </Row>
      <Spacer />
      {mode === "lnurl" && (
        <>
          <Text small b>
            This is a direct LNURL code. Only send this to recipients who
            already have a lightning wallet. The recipient will not be onboarded
            through Lightsats.
          </Text>
          <Spacer />
        </>
      )}
      {mode === "QR" &&
        tip.type === "NON_CUSTODIAL_NWC" &&
        !nwcConnectionString && (
          <>
            <Card css={{ dropShadow: "$sm" }}>
              <Card.Header>
                <Row justify="center" align="center">
                  <Text size={18} b>
                    Unlock QR code
                  </Text>
                </Row>
              </Card.Header>
              <Card.Divider />
              <Card.Body>
                <Row justify="center">
                  <Button onClick={linkWallet}>Link wallet with NWC</Button>
                </Row>
                <Spacer />
                <Row justify="center">or</Row>
                <Spacer />
                <Row justify="center">
                  Enter your&nbsp;
                  <Link
                    href="https://nwc.getalby.com"
                    target="_blank"
                    css={{ display: "inline" }}
                  >
                    NWC
                  </Link>
                  &nbsp;connection string
                </Row>
                <Row justify="center">
                  <Text size="small">
                    This connection string will be passed directly to your
                    recipient. It will not be stored in Lightsats.
                  </Text>
                </Row>
                <Row justify="center">
                  <Text size="small" b>
                    Warning: only tip users you trust and do not share this tip
                    link publically as there is currently no limit on how much
                    funds can be drawn from your wallet.
                  </Text>
                </Row>
                <Spacer />
                <Row>
                  <Input
                    label="NWC Connection String"
                    placeholder="nostrwalletconnect://..."
                    maxLength={255}
                    fullWidth
                    bordered
                    type="password"
                    value={nwcConnectionString}
                    onChange={(e) =>
                      isValidNostrConnectUrl(e.target.value) &&
                      setNwcConnectionString(e.target.value)
                    }
                  />
                </Row>
              </Card.Body>
            </Card>
          </>
        )}
      {mode === "QR" || mode === "lnurl" ? (
        tip.type !== "NON_CUSTODIAL_NWC" || nwcConnectionString ? (
          <Card css={{ dropShadow: "$sm" }}>
            <Card.Header>
              <Col>
                <Row justify="center" align="center">
                  <Text size={18} b>
                    👇 Let them scan this QR code
                  </Text>
                  &nbsp;
                  <Tooltip
                    content={
                      mode === "QR"
                        ? `Ask your recipient to scan the below code using their camera app or a QR
            code scanner app. You can also copy the URL to send via a message or
            email.`
                        : "Ask your recipient to scan this code with their lightning wallet."
                    }
                    color="primary"
                    css={{ minWidth: mode === "QR" ? "50%" : undefined }}
                    placement="left"
                  >
                    <Text color="primary">
                      <Icon>
                        <InformationCircleIcon />
                      </Icon>
                    </Text>
                  </Tooltip>
                </Row>
                <Row justify="center">
                  {qrCodeUrl && (
                    <NextLink
                      href={`${PageRoutes.tips}/qr?code=${encodeURIComponent(
                        qrCodeUrl
                      )}&mode=${mode}`}
                    >
                      <a>
                        <Button size="sm" bordered>
                          Open in fullscreen
                        </Button>
                      </a>
                    </NextLink>
                  )}
                  <Spacer />
                </Row>
              </Col>
            </Card.Header>
            <Card.Divider />
            <Card.Body>
              <Row justify="center">
                {qrCodeUrl ? (
                  <NextLink
                    href={mode === "QR" ? qrCodeUrl : `lightning:${qrCodeUrl}`}
                  >
                    <a>
                      {mode === "QR" ? (
                        <QRCode value={qrCodeUrl} />
                      ) : (
                        <LightningQRCode value={qrCodeUrl} />
                      )}
                    </a>
                  </NextLink>
                ) : (
                  <Loading />
                )}
              </Row>
            </Card.Body>
            <Card.Divider />
            <Card.Footer>
              <Row justify="space-between">
                <Button color="secondary" auto onClick={copyQRCodeUrl}>
                  <Icon>
                    <ClipboardDocumentIcon />
                  </Icon>
                  &nbsp;Copy {mode === "QR" ? "URL" : "LNURL"}
                </Button>
                <NextLink href={claimUrl}>
                  <a target="_blank">
                    <Button auto>
                      <Icon>
                        <ArrowTopRightOnSquareIcon />
                      </Icon>
                      &nbsp;Preview
                    </Button>
                  </a>
                </NextLink>
              </Row>
            </Card.Footer>
          </Card>
        ) : null
      ) : tip.type === "CUSTODIAL" ? (
        <Card css={{ dropShadow: "$sm" }}>
          <Card.Header>
            <Col>
              <Row justify="center">
                <Text size={18}>Ask them to enter these magic words at</Text>
              </Row>
              <Row justify="center">
                <Link
                  css={{ fontWeight: "bold" }}
                  href={getRedeemUrl()}
                  target="_blank"
                >
                  {getRedeemUrl(true)}
                </Link>
              </Row>
            </Col>
          </Card.Header>
          <Card.Divider />
          <Card.Body>
            {tip.passphrase ? (
              <Row justify="center">
                <Passphrase
                  passphrase={tip.passphrase}
                  width={128}
                  height={128}
                />
              </Row>
            ) : (
              <>
                <Spacer />
                <Row justify="center">
                  <Text>No passphrase set</Text>
                </Row>
                <Spacer />
                <Row justify="center">
                  <Button
                    onClick={generatePassphrase}
                    auto
                    disabled={isGeneratingPassphrase}
                  >
                    {isGeneratingPassphrase ? (
                      <Loading size="sm" />
                    ) : (
                      <>Generate</>
                    )}
                  </Button>
                </Row>
                <Spacer />
              </>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row justify="center">
          <Text b>Redeem codes are not supported for non-custodial tips</Text>
        </Row>
      )}
      {tip.type === "CUSTODIAL" && (
        <>
          <Spacer />
          <PrintCard tip={tip} />
        </>
      )}
      <Spacer />
    </>
  );
}

type PrintCardProps = { theme?: GiftCardTheme; tip: Tip };

function PrintCard({ theme = getDefaultGiftCardTheme(), tip }: PrintCardProps) {
  return (
    <Card css={{ dropShadow: "$sm" }}>
      <Card.Image
        src={`/tips/printed-cards/${theme}/preview.jpg`}
        objectFit="cover"
        width="100%"
        height="auto"
        alt="Card image background"
      />
      <Card.Footer
        css={{
          position: "absolute",
          color: "$white",
          bottom: 0,
          width: "100%",
          justifyContent: "flex-end",
        }}
      >
        <Text b color="white"></Text>
      </Card.Footer>
      <Card.Footer css={{ justifyItems: "flex-start" }}>
        <Col>
          <Row wrap="wrap" justify="space-between">
            <Text b>
              {theme === "christmas"
                ? "⌛ Need a last minute chrismas gift?"
                : "🎁 Looking for something more tangible?"}
            </Text>
          </Row>
          <Spacer />
          <Row justify="center">
            <NextLink href={`${PageRoutes.tips}/${tip.id}/print`}>
              <a>
                <Button>🖨️ Print card</Button>
              </a>
            </NextLink>
          </Row>
        </Col>
      </Card.Footer>
    </Card>
  );
}
