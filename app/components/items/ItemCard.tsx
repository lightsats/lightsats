import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import { Button, Collapse, Row, Spacer, Text } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { useIsMobile } from "hooks/useIsMobile";
import { placeholderDataUrl as defaultPlaceholderDataUrl } from "lib/constants";
import { getItemImageLocation } from "lib/utils";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import NextImage from "next/image";
import QRCode from "react-qr-code";
import { Item } from "types/Item";

type ItemCardProps = {
  item: Item;
  expanded?: boolean;
};

// function getItemFeatures(
//   item: Item,
//   locale: string,
//   t: TFunction
// ): ItemFeatureBadgeProps[] {
//   const hasLanguage = item.languageCodes.indexOf(locale) > -1;
//   const hasDefaultLanguage = item.languageCodes.indexOf(DEFAULT_LOCALE) > -1;
//   const itemFeatures: ItemFeatureBadgeProps[] = [
//     {
//       name: hasLanguage
//         ? getNativeLanguageName(locale)
//         : hasDefaultLanguage
//         ? getNativeLanguageName("en")
//         : item.languageCodes.join(", "),
//       variant: hasLanguage ? "success" : "warning",
//     },
//   ];
//   if (((item as Wallet).minBalance || 0) > 0) {
//     itemFeatures.push({
//       name: t("minBalance", {
//         minBalance: (item as Wallet).minBalance,
//       }),
//       variant: "warning",
//     });
//   }
//   const hasSafePlatform =
//     item.platforms.indexOf("mobile") > -1 || item.platforms.indexOf("web") > -1;
//   for (const platform of item.platforms) {
//     itemFeatures.push({
//       name: t(`platforms.${platform}`),
//       variant: hasSafePlatform ? "success" : "warning",
//     });
//   }
//   if (item.category === "wallets") {
//     const nonCustodial =
//       (item as Wallet).features?.indexOf("non-custodial") > -1;
//     itemFeatures.push({
//       name: nonCustodial ? t("nonCustodial") : t("custodial"),
//       variant: nonCustodial ? "success" : "warning",
//     });
//   }
//   if ((item as Wallet).features?.indexOf("lnurl-auth") > -1) {
//     itemFeatures.push({
//       name: t("scanToLogin"),
//       // variant: "success",
//     });
//   }
//   if ((item as Wallet).features?.indexOf("lightning address") > -1) {
//     itemFeatures.push({
//       name: t("lightningAddress"),
//       // variant: "success",
//     });
//   }
//   if ((item as LearnItem).difficulty) {
//     itemFeatures.push({
//       name: (item as LearnItem).difficulty,
//       // variant:
//       //   (item as LearnItem).difficulty === "easy"
//       //     ? "success"
//       //     : (item as LearnItem).difficulty === "medium"
//       //     ? "warning"
//       //     : "error",
//     });
//   }
//   return itemFeatures;
// }

export function ItemCard({ item, expanded }: ItemCardProps) {
  const { t } = useTranslation("items");
  //const router = useRouter();
  // const features: ItemFeatureBadgeProps[] = React.useMemo(
  //   () => getItemFeatures(item, router.locale || DEFAULT_LOCALE, t),
  //   [item, router.locale, t]
  // );
  const { data: session } = useSession();
  const isMobile = useIsMobile();

  const itemLink = item.link.replace(/{{userId}}/g, session?.user.id ?? "");

  return (
    <Collapse
      expanded={expanded}
      contentLeft={
        <NextImage
          alt=""
          width={64}
          height={64}
          src={getItemImageLocation(item)}
          style={{
            borderRadius: "8px",
            justifySelf: "flex-start",
            alignSelf: "flex-start",
          }}
          placeholder="blur"
          blurDataURL={item.placeholderDataUrl ?? defaultPlaceholderDataUrl}
        />
      }
      title={item.name}
    >
      <Text color="$gray">{item.slogan}</Text>
      {expanded && item.instructions && (
        <>
          <Spacer y={0.5} />
          <Text>Instructions</Text>
          <Text color="$gray" css={{ whiteSpace: "pre-line" }}>
            {item.instructions}
          </Text>
        </>
      )}
      {/*<Spacer y={0.5} />
      <Text color="$gray" size={10} b transform="uppercase">
        {t("features")}
      </Text>
      <Grid.Container css={{ gap: "$1" }}>
        {features.map((feature) => (
          <Grid key={feature.name}>
            <ItemFeatureBadge {...feature} />
          </Grid>
        ))}
        </Grid.Container>*/}
      <Spacer y={1} />
      <NextLink href={itemLink} passHref>
        <a target="_blank" rel="noreferrer noopener">
          <Row justify="flex-end" align="center">
            {!isMobile &&
              (item.platforms.indexOf("mobile") > -1 ||
                item.platforms.indexOf("desktop") === -1) && (
                <>
                  <QRCode value={itemLink} size={48} />
                  <Spacer />
                </>
              )}
            <Button auto>
              <Icon>
                <ArrowTopRightOnSquareIcon />
              </Icon>
              &nbsp;
              {item.category === "wallets" ? t("install") : t("open")}
            </Button>
          </Row>
        </a>
      </NextLink>
    </Collapse>
  );
}
