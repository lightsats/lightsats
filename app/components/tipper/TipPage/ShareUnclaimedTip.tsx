import { Button, Spacer, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { NextLink } from "components/NextLink";
import { notifySuccess } from "components/Toasts";
import copy from "copy-to-clipboard";
import { Routes } from "lib/Routes";
import { getLocalePath } from "lib/utils";
import React from "react";
import QRCode from "react-qr-code";

type ShareUnclaimedTipProps = {
  tip: Tip;
};

export function ShareUnclaimedTip({ tip }: ShareUnclaimedTipProps) {
  const claimUrl = `${
    global.window ? window.location.origin : process.env.APP_URL
  }${getLocalePath(tip.tippeeLocale)}${Routes.tips}/${tip.id}/claim`;

  const copyClaimUrl = React.useCallback(() => {
    if (claimUrl) {
      copy(claimUrl);
      notifySuccess("Copied to clipboard");
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
      <Spacer />
      <Text blockquote color={tip.claimLinkViewed ? "success" : undefined}>
        {tip.claimLinkViewed
          ? "This tip has been viewed!"
          : "This tip hasn't been viewed yet."}
      </Text>
    </>
  );
}
