import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { Button, Card, Row, Spacer, Text, Tooltip } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import copy from "copy-to-clipboard";
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
          <Row justify="center">
            <Text size={20} b>
              👇 Have your tippee scan this QR code
            </Text>
            &nbsp;
            <Tooltip
              content="Ask the tippee to scan the below code using their camera app or a QR
            code scanner app. You can also copy the URL to send via a message or
            email."
              color="primary"
            >
              <Text color="primary">
                <Icon>
                  <InformationCircleIcon />
                </Icon>
              </Text>
            </Tooltip>
          </Row>
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
    </>
  );
}
