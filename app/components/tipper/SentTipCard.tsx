import {
  Badge,
  Button,
  Card,
  Grid,
  Loading,
  Row,
  Spacer,
  Text,
  Tooltip,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { FiatPrice } from "components/FiatPrice";
import { NextLink } from "components/NextLink";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import copy from "copy-to-clipboard";
import { formatDistance, formatDistanceStrict } from "date-fns";
import { useExchangeRates } from "hooks/useExchangeRates";
import { DEFAULT_FIAT_CURRENCY, expirableTipStatuses } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
import { getClaimUrl, hasTipExpired } from "lib/utils";
import React, { CSSProperties } from "react";
import { toast } from "react-hot-toast";

const cardLinkStyle: CSSProperties = {
  flex: 1,
  position: "relative",
  display: "flex",
};

type SentTipCardProps = {
  tip: Tip;
  copyIndividualLinksEnabled?: boolean;
};

export function SentTipCard({
  tip,
  copyIndividualLinksEnabled,
}: SentTipCardProps) {
  const hasExpired = hasTipExpired(tip);
  const { data: exchangeRates } = useExchangeRates();
  const [copyTime, setCopyTime] = React.useState<Date | undefined>(undefined);

  return (
    <Grid xs={12} justify="center" alignItems="center">
      <>
        <NextLink href={`${PageRoutes.tips}/${tip.id}`}>
          <a style={cardLinkStyle}>
            <Card
              isPressable
              isHoverable
              css={{
                dropShadow: "$sm",
              }}
            >
              <Card.Body>
                <Row justify="space-between">
                  <Row css={{ gap: "$1" }}>
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
                            ⌛{" "}
                            {formatDistance(new Date(tip.expiry), Date.now())}
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
                  </Row>
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
        {copyIndividualLinksEnabled && (
          <>
            <Spacer />
            <Button
              auto
              color={tip.copiedClaimUrl ? "success" : undefined}
              size={tip.copiedClaimUrl ? "xs" : "sm"}
              css={{ width: "80px" }}
              onPress={() => {
                setCopyTime(new Date());
                copy(getClaimUrl(tip));
                (async () => {
                  const result = await fetch(
                    `/api/tipper/tips/${tip.id}/markCopied`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                    }
                  );
                  if (!result.ok) {
                    console.error(
                      "Failed to mark tip as copied: " + result.status
                    );
                  }
                })();
                toast.success("Link copied");
              }}
            >
              {copyTime && !tip.copiedClaimUrl ? (
                <Loading color="currentColor" size="sm" />
              ) : tip.copiedClaimUrl ? (
                <Tooltip
                  content={`
                      ${formatDistanceStrict(
                        Date.now(),
                        copyTime || new Date(tip.copiedClaimUrl)
                      )} ago`}
                >
                  Copied
                </Tooltip>
              ) : (
                <>Copy</>
              )}
            </Button>
          </>
        )}
      </>
    </Grid>
  );
}
