import { Button, Loading, Spacer, Text } from "@nextui-org/react";
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
      <Text>Waiting for payment</Text>
      <Loading type="points" color="currentColor" size="sm" />
      <Spacer />
      <NextLink href={`lightning:${invoice}`}>
        <a>
          <QRCode value={invoice} />
        </a>
      </NextLink>
      <Spacer />
      <Text size="small">
        Tap the QR code above to open your lightning wallet.
      </Text>
      <Spacer />
      <Button onClick={copyInvoice}>Copy</Button>
    </>
  );
}
