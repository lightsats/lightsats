import { EnvelopeOpenIcon } from "@heroicons/react/24/solid";
import { Card, Spacer, Text } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { getStaticProps } from "lib/i18n/i18next";
import { useTranslation } from "next-i18next";

export default function CodeSent() {
  const { t } = useTranslation("common");

  return (
    <>
      <Card color="default">
        <Card.Body style={{ textAlign: "center" }}>
          <div>
            <div>
              <Icon width={120} height={120}>
                <EnvelopeOpenIcon fontSize={200} />
              </Icon>
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
