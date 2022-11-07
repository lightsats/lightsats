import {
  Badge,
  Card,
  Grid,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { FiatPrice } from "components/FiatPrice";
import { NextLink } from "components/NextLink";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import { formatDistance, isAfter } from "date-fns";
import { DEFAULT_FIAT_CURRENCY, expirableTipStatuses } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import { CSSProperties } from "react";
import useSWR from "swr";
import { ExchangeRates } from "types/ExchangeRates";

const cardLinkStyle: CSSProperties = { flex: 1 };

export function Tips() {
  const { data: session } = useSession();
  const { data: tips } = useSWR<Tip[]>(
    session ? "/api/tipper/tips" : null,
    defaultFetcher
  );
  const { data: exchangeRates } = useSWR<ExchangeRates>(
    `/api/exchange/rates`,
    defaultFetcher
  );

  if (session && !tips) {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }

  const reclaimedTips = tips?.filter((tip) => tip.status === "RECLAIMED");

  if (tips?.length) {
    return (
      <>
        {reclaimedTips && reclaimedTips.length > 0 && (
          <>
            <Text>
              {reclaimedTips.map((tip) => tip.amount).reduce((a, b) => a + b)}⚡{" "}
              reclaimed
            </Text>
            <NextLink href={Routes.tipperWithdraw} passHref>
              <Link color="success">withdraw sats</Link>
            </NextLink>
            <Spacer />
          </>
        )}
        <Grid.Container justify="center">
          {tips.map((tip) => {
            const hasExpired =
              expirableTipStatuses.indexOf(tip.status) >= 0 &&
              isAfter(new Date(), new Date(tip.expiry));
            return (
              <Grid xs={12} key={tip.id} justify="center">
                <NextLink href={`${Routes.tips}/${tip.id}`}>
                  <a style={cardLinkStyle}>
                    <Card variant="flat" isPressable isHoverable>
                      <Card.Body>
                        <Row justify="space-between" align="center">
                          <Badge>
                            {" "}
                            {tip.amount}⚡{" "}
                            <FiatPrice
                              currency={tip.currency ?? DEFAULT_FIAT_CURRENCY}
                              exchangeRate={
                                exchangeRates?.[
                                  tip.currency ?? DEFAULT_FIAT_CURRENCY
                                ]
                              }
                              sats={tip.amount}
                            />
                          </Badge>
                          <Spacer x={0.25} />
                          <TipStatusBadge status={tip.status} />
                        </Row>
                        <Spacer y={0.5} />
                        <Row justify="space-between" align="center">
                          <Text small>
                            Created{" "}
                            {formatDistance(Date.now(), new Date(tip.created))}{" "}
                            ago
                          </Text>
                          {!hasExpired &&
                            expirableTipStatuses.indexOf(tip.status) >= 0 && (
                              <Text small>
                                Expires in{" "}
                                {formatDistance(
                                  new Date(tip.expiry),
                                  Date.now()
                                )}
                              </Text>
                            )}
                          {hasExpired && (
                            <Text color="error" small>
                              Expired
                            </Text>
                          )}
                        </Row>
                      </Card.Body>
                    </Card>
                  </a>
                </NextLink>
              </Grid>
            );
          })}
        </Grid.Container>
      </>
    );
  }

  return <>No tips yet</>;
}
