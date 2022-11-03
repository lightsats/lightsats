import { Badge, Col, Collapse, Row, Spacer, Text } from "@nextui-org/react";
import {
  ItemFeatureBadge,
  ItemFeatureBadgeProps,
} from "components/items/ItemFeatureBadge";
import ISO6391 from "iso-639-1";
import NextImage from "next/image";
import NextLink from "next/link";
import React from "react";
import { Item } from "types/Item";
import { Wallet } from "types/Wallet";

type ItemCardProps = {
  item: Item;
};

function getItemFeatures(item: Item): ItemFeatureBadgeProps[] {
  const hasLanguage = item.languageCodes.indexOf("en") > -1;
  const itemFeatures: ItemFeatureBadgeProps[] = [
    {
      name: ISO6391.getNativeName("en"), // TODO: current language
      variant: hasLanguage ? "success" : "warning",
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
  const hasSafePlatform =
    item.platforms.indexOf("mobile") > -1 || item.platforms.indexOf("web") > -1;
  for (const platform of item.platforms) {
    itemFeatures.push({
      name: platform,
      variant: hasSafePlatform ? "success" : "warning",
    });
  }
  if ((item as Wallet).features?.indexOf("lnurl-auth") > -1) {
    itemFeatures.push({
      name: `Scan to login`,
      variant: "success",
    });
  }
  return itemFeatures;
}

export function ItemCard({ item }: ItemCardProps) {
  const features: ItemFeatureBadgeProps[] = React.useMemo(
    () => getItemFeatures(item),
    [item]
  );

  // TODO: get features based on item type and move to a separate component
  return (
    <Collapse
      title={
        <Row align="center">
          <NextImage
            alt=""
            width={64}
            height={64}
            src={`/items/${item.category}/${item.image}`}
            style={{ borderRadius: "8px" }}
          />
          <Spacer x={0.5} />
          <Col>
            <Row>
              <Text b>{item.name}</Text>
            </Row>
            <Row>
              <Text size="x-small" b css={{ color: "$gray500" }}>
                {item.slogan}
              </Text>
            </Row>
          </Col>
        </Row>
      }
    >
      <NextLink href={item.link} passHref>
        <a target="_blank">
          <Row
            align="center"
            css={{ backgroundColor: "$gray900", p: 10, br: 10 }}
          >
            <Row
              justify="flex-start"
              align="flex-start"
              style={{ flexWrap: "wrap", gap: "8px" }}
            >
              {features.map((feature) => (
                <ItemFeatureBadge key={feature.name} {...feature} />
              ))}
            </Row>

            <Col span={2}>
              <Badge
                css={{
                  background: "$success",
                  //borderColor: "$black",
                  color: "$white",
                  borderColor: "$success",
                }}
              >
                {item.category === "wallets" ? "GET" : "VISIT"}
              </Badge>
            </Col>
          </Row>
        </a>
      </NextLink>
    </Collapse>
  );
}
