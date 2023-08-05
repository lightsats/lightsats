import {
  Badge,
  Card,
  Grid,
  Row,
  Spacer,
  Text,
  Tooltip,
} from "@nextui-org/react";
import { ExpiryBadge } from "components/ExpiryBadge";
import { FiatPrice } from "components/FiatPrice";
import { NextLink } from "components/NextLink";
import { TipGroupProgress } from "components/tipper/TipGroupProgress";
import { TipGroupStatusBadge } from "components/tipper/TipGroupStatusBadge";
import { formatDistance } from "date-fns";
import { useExchangeRates } from "hooks/useExchangeRates";
import { DEFAULT_FIAT_CURRENCY } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
import { isTipGroupActive } from "lib/utils";
import { CSSProperties } from "react";
import { TipGroupWithTips } from "types/TipGroupWithTips";

const cardLinkStyle: CSSProperties = {
  flex: 1,
  position: "relative",
  marginBottom: 25,
};

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
          <Card isPressable isHoverable css={{ dropShadow: "$sm", zIndex: 10 }}>
            <Card.Body>
              <Row justify="space-between" align="center">
                <Row css={{ gap: "$1" }} align="center">
                  <Tooltip
                    color="primary"
                    triggerCss={{ display: "inline" }}
                    content={
                      tipGroup.tips.some((tip) => tip.tippeeName) && (
                        <Text color="$white" size="small">
                          To{" "}
                          {tipGroup.tips
                            .map((tip) => tip.tippeeName)
                            .join(", ")}
                        </Text>
                      )
                    }
                  >
                    <Badge variant="flat" color="primary">
                      👨 {tipGroup.tips.length}
                    </Badge>
                  </Tooltip>
                  <TipGroupStatusBadge tipGroup={tipGroup} />
                  <ExpiryBadge tip={firstTip} viewing="tippee" />
                </Row>
                <Text b>
                  <FiatPrice
                    currency={firstTip.currency ?? DEFAULT_FIAT_CURRENCY}
                    exchangeRate={
                      exchangeRates?.[
                        firstTip.currency ?? DEFAULT_FIAT_CURRENCY
                      ]
                    }
                    sats={firstTip.amount * tipGroup.tips.length}
                  />
                  &nbsp;
                </Text>
              </Row>
              <Spacer y={0.5} />
              <Row justify="space-between" align="flex-end">
                <Text size="small" color="$gray700">
                  Created&nbsp;
                  {formatDistance(Date.now(), new Date(tipGroup.created))} ago
                </Text>
                <Text size="small">
                  {firstTip.amount * tipGroup.tips.length} sats
                </Text>
              </Row>
              {isTipGroupActive(tipGroup) && (
                <>
                  <Spacer y={0.5} />
                  <TipGroupProgress tipGroup={tipGroup} />
                </>
              )}
            </Card.Body>
          </Card>
          <Card
            css={{
              position: "absolute",
              left: "10px",
              width: "calc(100% - 20px)",
              bottom: "-6px",
              zIndex: 1,
              height: "20px",
              dropShadow: "$sm",
            }}
          >
            &nbsp;
          </Card>
          <Card
            css={{
              position: "absolute",
              width: "calc(100% - 40px)",
              bottom: "-12px",
              left: "20px",
              right: "20px",
              zIndex: 0,
              height: "20px",
              dropShadow: "$sm",
            }}
          >
            &nbsp;
          </Card>
        </a>
      </NextLink>
    </Grid>
  );
}
