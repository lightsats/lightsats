import { Button, Spacer, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { NextLink } from "components/NextLink";
import copy from "copy-to-clipboard";
import { Routes } from "lib/Routes";
import { getAppUrl, getLocalePath } from "lib/utils";
import React from "react";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";

type ShareUnclaimedTipProps = {
  tip: Tip;
};

export function ShareUnclaimedTip({ tip }: ShareUnclaimedTipProps) {
  const claimUrl = `${getAppUrl()}${getLocalePath(tip.tippeeLocale)}${
    Routes.tips
  }/${tip.id}/claim`;

  const copyClaimUrl = React.useCallback(() => {
    if (claimUrl) {
      copy(claimUrl);
      toast.success("Copied to clipboard");
    }
  }, [claimUrl]);

  return (
    <>
      <Text style={{ textAlign: "center" }}>
        Ask the tippee to scan the below code using their camera app or a QR
        code scanner app. You can also copy the URL to send via a message or
        email.
      </Text>
      <Spacer />
      <NextLink href={claimUrl}>
        <a>
          <QRCode value={claimUrl} />
        </a>
      </NextLink>
      <Spacer />
      <Button onClick={copyClaimUrl}>Copy URL</Button>
    </>
  );
}
