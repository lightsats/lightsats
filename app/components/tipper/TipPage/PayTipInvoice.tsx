import { ClipboardDocumentIcon, WalletIcon } from "@heroicons/react/24/solid";
import { Button, Card, Col, Loading, Row, Text } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { notifySuccess } from "components/Toasts";
import copy from "copy-to-clipboard";
import React from "react";
import QRCode from "react-qr-code";

type PayTipInvoiceProps = {
  invoice: string;
};

export function PayTipInvoice({ invoice }: PayTipInvoiceProps) {
  const copyInvoice = React.useCallback(() => {
    copy(invoice);
    notifySuccess("Copied to clipboard");
  }, [invoice]);

  return (
    <>
      <Card>
        <Card.Header>
          <Row>
            <Col>
              <Text size={20} b>
                💸 Fund this tip
              </Text>
            </Col>
            <Col style={{ textAlign: "right", alignSelf: "center" }}>
              <Loading type="default" color="currentColor" size="sm" />
            </Col>
          </Row>
        </Card.Header>
        <Card.Divider />
        <Card.Body>
          <Row justify="center">
            <NextLink href={`lightning:${invoice}`}>
              <a>
                <QRCode value={invoice} />
              </a>
            </NextLink>
          </Row>
        </Card.Body>
        <Card.Divider />
        <Card.Footer>
          <Row justify="space-between">
            <Button color="secondary" auto onClick={copyInvoice}>
              <Icon>
                <ClipboardDocumentIcon />
              </Icon>
              &nbsp;Copy
            </Button>
            <Button auto href={`lightning:${invoice}`}>
              <Icon>
                <WalletIcon />
              </Icon>
              &nbsp;Open in wallet
            </Button>
          </Row>
        </Card.Footer>
      </Card>
    </>
  );
}
