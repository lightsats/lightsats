import { WalletIcon } from "@heroicons/react/24/solid";
import {
  Badge,
  Button,
  Card,
  Col,
  Grid,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { FiatPrice } from "components/FiatPrice";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { NewTipButton } from "components/tipper/NewTipButton";
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

  return (
    <>
      {reclaimedTips && reclaimedTips.length > 0 && (
        <>
          <Card variant="bordered">
            <Card.Body>
              <Row justify="space-between" align="center">
                <Col>
                  <Text size={24} b>
                    {reclaimedTips
                      .map((tip) => tip.amount)
                      .reduce((a, b) => a + b)}
                    &nbsp;sats
                  </Text>
                  <Text>&nbsp;from reclaimed tips</Text>
                </Col>
                <NextLink href={Routes.tipperWithdraw}>
                  <a>
                    <Button auto color="primary">
                      <Icon>
                        <WalletIcon />
                      </Icon>
                      &nbsp;Withdraw
                    </Button>
                  </a>
                </NextLink>
              </Row>
            </Card.Body>
          </Card>
          <Spacer />
        </>
      )}
      <Text h3>🙌 Your tips</Text>
      {tips && tips.length > 0 && (
        <Grid.Container justify="center" gap={1}>
          {tips.map((tip) => {
            const hasExpired =
              expirableTipStatuses.indexOf(tip.status) >= 0 &&
              isAfter(new Date(), new Date(tip.expiry));
            return (
              <Grid xs={12} key={tip.id} justify="center">
                <NextLink href={`${Routes.tips}/${tip.id}`}>
                  <a style={cardLinkStyle}>
                    <Card isPressable isHoverable css={{ dropShadow: "$sm" }}>
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
      )}
      {!tips ||
        (!tips.length && (
          <>
            <Text h3></Text>
            {"No tips available, let's create your first one now!"}
            <Spacer />
            <NewTipButton />
          </>
        ))}
    </>
  );
}
