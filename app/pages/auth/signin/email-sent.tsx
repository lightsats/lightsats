import { Text } from "@nextui-org/react";
import { getStaticProps } from "lib/i18n/i18next";
import { useTranslation } from "next-i18next";

export default function CodeSent() {
  const { t } = useTranslation("common");

  return (
    <>
      <Text h2>{t("checkEmail")}</Text>
      <Text>{t("codeSent")}</Text>
    </>
  );
}

export { getStaticProps };
