import { Card, Image, Spacer, Text } from "@nextui-org/react";
import { getStaticProps } from "lib/i18n/i18next";
import { useTranslation } from "next-i18next";

export default function CodeSent() {
  const { t } = useTranslation("common");

  return (
    <>
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Body style={{ textAlign: "center" }}>
          <div>
            <div>
              <Image width={200} src="/images/icons/mail.png" alt="email" />
            </div>
            <Spacer />
            <Text h3>{t("checkEmailTitle")}</Text>
            <Spacer />
            {t("checkEmailText")}
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

export { getStaticProps };
