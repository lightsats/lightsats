import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import { Button, Collapse, Row, Spacer, Text } from "@nextui-org/react";
import { Icon } from "components/Icon";
import {
  ItemFeatureBadge,
  ItemFeatureBadgeProps,
} from "components/items/ItemFeatureBadge";
import { NextLink } from "components/NextLink";
import ISO6391 from "iso-639-1";
import { placeholderDataUrl as defaultPlaceholderDataUrl } from "lib/constants";
import { getItemImageLocation } from "lib/utils";
import NextImage from "next/image";
import React from "react";
import { Item } from "types/Item";
import { LearnItem } from "types/LearnItem";
import { Wallet } from "types/Wallet";

type ItemCardProps = {
  item: Item;
  expanded?: boolean;
};

function getItemFeatures(item: Item): ItemFeatureBadgeProps[] {
  //const hasLanguage = item.languageCodes.indexOf("en") > -1;
  const itemFeatures: ItemFeatureBadgeProps[] = [
    {
      name: ISO6391.getNativeName("en"), // TODO: current language
      // variant: hasLanguage ? "success" : "warning",
    },
  ];
  if (((item as Wallet).minBalance || 0) > 0) {
    itemFeatures.push({
      name: `${(item as Wallet).minBalance}⚡ min balance`,
      variant: "warning",
    });
  }
  // if (item.lightsatsRecommended) {
  //   itemFeatures.push({
  //     name: `LS⚡ recommended`,
  //     variant: "success",
  //   });
  // }
  // const hasSafePlatform =
  //   item.platforms.indexOf("mobile") > -1 || item.platforms.indexOf("web") > -1;
  for (const platform of item.platforms) {
    itemFeatures.push({
      name: platform,
      // variant: hasSafePlatform ? "success" : "warning",
    });
  }
  if ((item as Wallet).features?.indexOf("lnurl-auth") > -1) {
    itemFeatures.push({
      name: `Scan to login`,
      // variant: "success",
    });
  }
  if ((item as LearnItem).difficulty) {
    itemFeatures.push({
      name: (item as LearnItem).difficulty,
      // variant:
      //   (item as LearnItem).difficulty === "easy"
      //     ? "success"
      //     : (item as LearnItem).difficulty === "medium"
      //     ? "warning"
      //     : "error",
    });
  }
  return itemFeatures;
}

export function ItemCard({ item, expanded }: ItemCardProps) {
  const features: ItemFeatureBadgeProps[] = React.useMemo(
    () => getItemFeatures(item),
    [item]
  );

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
      <Spacer y={1} />
      <NextLink href={item.link} passHref>
        <a target="_blank" rel="noreferrer noopener">
          <Row align="center" css={{ p: 10, br: 10 }}>
            <Row
              justify="flex-start"
              align="flex-start"
              style={{ flexWrap: "wrap", gap: "8px" }}
            >
              {features.map((feature) => (
                <ItemFeatureBadge key={feature.name} {...feature} />
              ))}
            </Row>

            <Button auto>
              <Icon>
                <ArrowTopRightOnSquareIcon />
              </Icon>
              &nbsp;
              {item.category === "wallets" ? "Install" : "Open"}
            </Button>
          </Row>
        </a>
      </NextLink>
    </Collapse>
  );
}
