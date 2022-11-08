import { Button } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { Routes } from "lib/Routes";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

export function LightningLoginButton() {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <NextLink
      href={`${Routes.lnurlAuthSignin}?callbackUrl=${encodeURIComponent(
        router.pathname
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
