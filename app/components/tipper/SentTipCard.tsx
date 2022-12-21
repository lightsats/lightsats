import {
  Badge,
  Card,
  Grid,
  Row,
  Spacer,
  Text,
  Tooltip,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { FiatPrice } from "components/FiatPrice";
import { NextLink } from "components/NextLink";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import { formatDistance } from "date-fns";
import { useExchangeRates } from "hooks/useExchangeRates";
import { DEFAULT_FIAT_CURRENCY, expirableTipStatuses } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
import { hasTipExpired } from "lib/utils";
import { CSSProperties } from "react";

const cardLinkStyle: CSSProperties = { flex: 1 };

type SentTipCardProps = {
  tip: Tip;
};

export function SentTipCard({ tip }: SentTipCardProps) {
  const hasExpired = hasTipExpired(tip);
  const { data: exchangeRates } = useExchangeRates();

  return (
    <Grid xs={12} justify="center">
      <NextLink href={`${PageRoutes.tips}/${tip.id}`}>
        <a style={cardLinkStyle}>
          <Card isPressable isHoverable css={{ dropShadow: "$sm" }}>
            <Card.Body>
              <Row justify="space-between">
                <Text color="#F8AF43">
                  {tip.groupId && <Badge>Part of a group</Badge>}
                  <TipStatusBadge tip={tip} />
                  {!hasExpired &&
                    expirableTipStatuses.indexOf(tip.status) >= 0 && (
                      <Tooltip
                        content={`Expires in ${formatDistance(
                          new Date(),
                          new Date(tip.expiry)
                        )}`}
                        color="primary"
                        triggerCss={{ display: "inline" }}
                      >
                        <Badge
                          color="primary"
                          variant="flat"
                          size="xs"
                          css={{
                            letterSpacing: 0,
                            fontWeight: 400,
                          }}
                        >
                          ⌛ {formatDistance(new Date(tip.expiry), Date.now())}
                        </Badge>
                      </Tooltip>
                    )}
                  {hasExpired && (
                    <Tooltip
                      content={`Expired ${formatDistance(
                        new Date(),
                        new Date(tip.expiry)
                      )} ago`}
                      color="primary"
                      triggerCss={{ display: "inline" }}
                    >
                      <Badge variant="flat" color="warning" size="xs">
                        ⌛ Expired
                      </Badge>
                    </Tooltip>
                  )}
                </Text>
                <Text b>
                  <FiatPrice
                    currency={tip.currency ?? DEFAULT_FIAT_CURRENCY}
                    exchangeRate={
                      exchangeRates?.[tip.currency ?? DEFAULT_FIAT_CURRENCY]
                    }
                    sats={tip.amount}
                  />
                </Text>
              </Row>
              <Spacer y={0.5} />
              <Row justify="space-between" align="flex-end">
                <Row align="center" css={{ color: "$gray700" }}>
                  {tip.tippeeName && (
                    <>
                      <Text color="$gray700" size="small">
                        To {tip.tippeeName}
                      </Text>
                      <Spacer x={0.25} />
                      •
                      <Spacer x={0.25} />
                    </>
                  )}
                  <Text size="small" color="$gray700">
                    Created&nbsp;
                    {formatDistance(Date.now(), new Date(tip.created))} ago
                  </Text>
                </Row>
                <Row css={{ flexShrink: 0 }} fluid={false}>
                  <Text size="small">{tip.amount} sats</Text>
                </Row>
              </Row>
            </Card.Body>
          </Card>
        </a>
      </NextLink>
    </Grid>
  );
}
