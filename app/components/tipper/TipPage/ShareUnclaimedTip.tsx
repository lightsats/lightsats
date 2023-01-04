import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Col,
  Row,
  Spacer,
  Text,
  Tooltip,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import copy from "copy-to-clipboard";
import { PageRoutes } from "lib/PageRoutes";
import { getClaimUrl } from "lib/utils";
import React from "react";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";

type ShareUnclaimedTipProps = {
  tip: Tip;
};

export function ShareUnclaimedTip({ tip }: ShareUnclaimedTipProps) {
  const claimUrl = getClaimUrl(tip);

  const copyClaimUrl = React.useCallback(() => {
    if (claimUrl) {
      copy(claimUrl);
      toast.success("Copied to clipboard");
    }
  }, [claimUrl]);

  return (
    <>
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
          <Row></Row>
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
      <Spacer />
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Image
          src="/tips/printed-cards/christmas/preview.jpg"
          objectFit="cover"
          width="100%"
          height={340}
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
              <Text b>⌛ Need a last minute chrismas gift?</Text>
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
      <Spacer y={3} />
    </>
  );
}
