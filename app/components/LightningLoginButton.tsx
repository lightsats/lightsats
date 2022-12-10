import { Button } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { PageRoutes } from "lib/PageRoutes";
import { useTranslation } from "next-i18next";

type LightningLoginButtonProps = {
  callbackUrl?: string;
};

export function LightningLoginButton({
  callbackUrl,
}: LightningLoginButtonProps) {
  const { t } = useTranslation("common");

  return (
    <NextLink
      href={`${PageRoutes.lnurlAuthSignin}?callbackUrl=${encodeURIComponent(
        callbackUrl ?? PageRoutes.dashboard
      )}`}
    >
      <a style={{ width: "100%" }}>
        <Button css={{ width: "100%" }}>⚡ {t("loginWithLightning")}</Button>
      </a>
    </NextLink>
  );
}
