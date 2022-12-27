import { Card, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { FiatPrice } from "components/FiatPrice";
import { NextLink } from "components/NextLink";
import { TipGroupProgress } from "components/tipper/TipGroupProgress";
import { TipGroupStatusBadge } from "components/tipper/TipGroupStatusBadge";
import { formatDistance } from "date-fns";
import { useExchangeRates } from "hooks/useExchangeRates";
import { DEFAULT_FIAT_CURRENCY } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
import { CSSProperties } from "react";
import { TipGroupWithTips } from "types/TipGroupWithTips";

const cardLinkStyle: CSSProperties = { flex: 1 };

type SentTipGroupCardProps = {
  tipGroup: TipGroupWithTips;
};

export function SentTipGroupCard({ tipGroup }: SentTipGroupCardProps) {
  const { data: exchangeRates } = useExchangeRates();
  const firstTip = tipGroup.tips[0];
  return (
    <Grid xs={12} justify="center">
      <NextLink href={`${PageRoutes.tipGroups}/${tipGroup.id}`}>
        <a style={cardLinkStyle}>
          <Card isPressable isHoverable css={{ dropShadow: "$sm" }}>
            <Card.Body>
              <Row justify="space-between" align="center">
                <TipGroupStatusBadge tipGroup={tipGroup} />
                <TipGroupProgress tipGroup={tipGroup} />
                <Text b>
                  <FiatPrice
                    currency={firstTip.currency ?? DEFAULT_FIAT_CURRENCY}
                    exchangeRate={
                      exchangeRates?.[
                        firstTip.currency ?? DEFAULT_FIAT_CURRENCY
                      ]
                    }
                    sats={firstTip.amount}
                  />
                  &nbsp;x{tipGroup.tips.length}
                </Text>
              </Row>
              <Spacer y={0.5} />
              {tipGroup.tips.some((tip) => tip.tippeeName) && (
                <>
                  <Row>
                    <Text color="$gray700" size="small">
                      To {tipGroup.tips.map((tip) => tip.tippeeName).join(", ")}
                    </Text>
                  </Row>
                  <Spacer y={0.5} />
                </>
              )}
              <Row justify="space-between" align="flex-end">
                <Text size="small" color="$gray700">
                  Created&nbsp;
                  {formatDistance(Date.now(), new Date(tipGroup.created))} ago
                </Text>
                <Text size="small">
                  {firstTip.amount} sats&nbsp;x{tipGroup.tips.length}
                </Text>
              </Row>
            </Card.Body>
          </Card>
        </a>
      </NextLink>
    </Grid>
  );
}
