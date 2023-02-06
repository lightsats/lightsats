import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Col,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
  Tooltip,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { Passphrase } from "components/tipper/Passphrase";
import copy from "copy-to-clipboard";
import { ApiRoutes } from "lib/ApiRoutes";
import { PageRoutes } from "lib/PageRoutes";
import {
  getClaimUrl,
  getDefaultGiftCardTheme,
  getRedeemUrl,
  tryGetErrorMessage,
} from "lib/utils";
import React from "react";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import { GiftCardTheme } from "types/GiftCardTheme";

type ShareUnclaimedTipProps = {
  tip: Tip;
};

export function ShareUnclaimedTip({ tip }: ShareUnclaimedTipProps) {
  const claimUrl = getClaimUrl(tip);
  const [mode, setMode] = React.useState<"QR" | "passphrase">("QR");
  const [isGeneratingPassphrase, setGeneratingPassphrase] =
    React.useState(false);

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

  React.useEffect(() => {
    if (isGeneratingPassphrase && tip.passphrase) {
      setGeneratingPassphrase(false);
    }
  }, [isGeneratingPassphrase, tip]);

  const copyClaimUrl = React.useCallback(() => {
    if (claimUrl) {
      copy(claimUrl);
      toast.success("Copied to clipboard");
    }
  }, [claimUrl]);

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
      {mode === "QR" ? (
        <Card css={{ dropShadow: "$sm" }}>
          <Card.Header>
            <Col>
              <Row justify="center" align="center">
                <Text size={18} b>
                  👇 Let them scan this QR code
                </Text>
                &nbsp;
                <Tooltip
                  content="Ask the tippee to scan the below code using their camera app or a QR
            code scanner app. You can also copy the URL to send via a message or
            email."
                  color="primary"
                  css={{ minWidth: "50%" }}
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
                <NextLink href={`${PageRoutes.tips}/${tip.id}/qr`}>
                  <a>
                    <Button size="sm" bordered>
                      Open in fullscreen
                    </Button>
                  </a>
                </NextLink>
                <Spacer />
              </Row>
            </Col>
          </Card.Header>
          <Card.Divider />
          <Card.Body>
            <Row justify="center">
              <NextLink href={claimUrl}>
                <a>
                  <QRCode value={claimUrl} />
                </a>
              </NextLink>
            </Row>
          </Card.Body>
          <Card.Divider />
          <Card.Footer>
            <Row justify="space-between">
              <Button color="secondary" auto onClick={copyClaimUrl}>
                <Icon>
                  <ClipboardDocumentIcon />
                </Icon>
                &nbsp;Copy URL
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
      ) : (
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
      )}
      <Spacer />
      <PrintCard tip={tip} />
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
