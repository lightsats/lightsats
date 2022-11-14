import { InformationCircleIcon, WalletIcon } from "@heroicons/react/24/solid";
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
  Tooltip,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { FiatPrice } from "components/FiatPrice";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { NewTipButton } from "components/tipper/NewTipButton";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import { formatDistance } from "date-fns";
import { DEFAULT_FIAT_CURRENCY, expirableTipStatuses } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { hasTipExpired } from "lib/utils";
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
    return <Loading color="currentColor" size="sm" />;
  }

  const reclaimedTips = tips?.filter((tip) => tip.status === "RECLAIMED");

  return (
    <>
      {reclaimedTips && reclaimedTips.length > 0 && (
        <>
          <Spacer y={2} />

          <Row justify="center">
            <Text h3>Returned tips</Text>
            <Tooltip
              content="Expired or reclaimed tips return back to you. ✌️"
              color="primary"
            >
              &nbsp;
              <Text color="primary">
                <Icon style={{ color: "$primary" }}>
                  <InformationCircleIcon />
                </Icon>
              </Text>
            </Tooltip>
          </Row>
          <Card css={{ dropShadow: "$sm" }}>
            <Card.Body>
              <Row justify="space-between" align="center">
                <Col>
                  <Text size="$lg" b>
                    {reclaimedTips
                      .map((tip) => tip.amount)
                      .reduce((a, b) => a + b)}
                    &nbsp;sats
                  </Text>
                </Col>
                <NextLink href={Routes.tipperWithdraw}>
                  <a>
                    <Button auto color="secondary">
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
          <Spacer y={2} />
        </>
      )}
      <Text h3>Recent tips</Text>
      {tips && tips.length > 0 && (
        <Grid.Container justify="center" gap={1}>
          {tips.map((tip) => {
            const hasExpired = hasTipExpired(tip);

            return (
              <Grid xs={12} key={tip.id} justify="center">
                <NextLink href={`${Routes.tips}/${tip.id}`}>
                  <a style={cardLinkStyle}>
                    <Card isPressable isHoverable css={{ dropShadow: "$sm" }}>
                      <Card.Body>
                        <Row justify="space-between">
                          <Text color="#F8AF43">
                            <TipStatusBadge status={tip.status} />
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
                                    {formatDistance(
                                      new Date(tip.expiry),
                                      Date.now()
                                    )}
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
                                exchangeRates?.[
                                  tip.currency ?? DEFAULT_FIAT_CURRENCY
                                ]
                              }
                              sats={tip.amount}
                            />
                          </Text>
                        </Row>
                        <Row justify="space-between">
                          <Text>
                            &nbsp;
                            {formatDistance(
                              Date.now(),
                              new Date(tip.created)
                            )}{" "}
                            ago
                          </Text>
                          <Text>{tip.amount} sats</Text>
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
