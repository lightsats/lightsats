import { Button } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { Routes } from "lib/Routes";
import { useTranslation } from "next-i18next";

export function LightningLoginButton() {
  const { t } = useTranslation("common");
  return (
    <NextLink
      href={`${Routes.lnurlAuthSignin}?callbackUrl=${encodeURIComponent(
        window.location.href
      )}`}
    >
      <a style={{ width: "100%" }}>
        <Button bordered css={{ width: "100%", background: "white" }}>
          {t("loginWithLightning")}⚡
        </Button>
      </a>
    </NextLink>
  );
}
