import { Card, Grid, Text } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { PageRoutes } from "lib/PageRoutes";
import { CSSProperties } from "react";
import { TipGroupWithTips } from "types/TipGroupWithTips";

const cardLinkStyle: CSSProperties = { flex: 1 };

type SentTipGroupCardProps = {
  tipGroup: TipGroupWithTips;
};

export function SentTipGroupCard({ tipGroup }: SentTipGroupCardProps) {
  return (
    <Grid xs={12} justify="center">
      <NextLink href={`${PageRoutes.tipGroups}/${tipGroup.id}`}>
        <a style={cardLinkStyle}>
          <Card isPressable isHoverable css={{ dropShadow: "$sm" }}>
            <Card.Body>
              <Text>Group of {tipGroup.quantity} tips</Text>
            </Card.Body>
          </Card>
        </a>
      </NextLink>
    </Grid>
  );
}
