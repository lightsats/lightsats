import { Badge, Card, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Tip, TipStatus } from "@prisma/client";
import { FiatPrice } from "components/FiatPrice";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import { formatDistance } from "date-fns";
import { DEFAULT_FIAT_CURRENCY } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import useSWR from "swr";
import { ExchangeRates } from "types/ExchangeRates";

const expirableTipStatuses: TipStatus[] = ["UNFUNDED", "UNCLAIMED", "CLAIMED"];

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
    return <>Loading</>;
  }

  if (tips?.length) {
    return (
      <Grid.Container gap={2} justify="center">
        {tips.map((tip) => (
          <Grid xs={12} key={tip.id} justify="center">
            <NextLink href={`${Routes.tips}/${tip.id}`}>
              <a style={{ maxWidth: "400px" }}>
                <Card isPressable isHoverable>
                  <Card.Body>
                    <Row justify="space-between">
                      <Text style={{ flex: 1 }}>
                        {tip.invoice.substring(0, 16)}...
                      </Text>
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
                    {expirableTipStatuses.indexOf(tip.status) >= 0 && (
                      <Text small>
                        Expires in{" "}
                        {formatDistance(new Date(tip.expiry), Date.now())}
                      </Text>
                    )}
                  </Card.Body>
                </Card>
              </a>
            </NextLink>
          </Grid>
        ))}
      </Grid.Container>
    );
  }

  return <>No tips yet</>;
}
