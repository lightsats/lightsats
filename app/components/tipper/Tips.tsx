import { InformationCircleIcon, WalletIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Col,
  Grid,
  Link,
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
      <Spacer></Spacer>
      <Row justify="space-between">
        <Text h4>Suggestions</Text>
        <Text>
          <Link href={Routes.guide}>See all</Link>
        </Text>
      </Row>
      <Row>
        <Grid.Container gap={2} css={{ width: "100%" }}>
          <Grid>
            <Card css={{ dropShadow: "$sm" }}>
              <Card.Body>
                <Row>
                  <Button color="primary" auto flat css={{ p: 8 }}>
                    <Icon>
                      <WalletIcon />
                    </Icon>
                  </Button>
                  <Spacer x={0.5} />
                  <Col>
                    <Text b>Buy a giftcard</Text>
                    <Text color="$gray" css={{ lh: "$sm" }}>
                      Select from a range of gift cards.
                    </Text>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Grid>
          <Grid>
            <Card css={{ dropShadow: "$sm" }}>
              <Card.Body>
                <Row>
                  <Button color="primary" auto flat css={{ p: 8 }}>
                    <Icon>
                      <WalletIcon />
                    </Icon>
                  </Button>
                  <Spacer x={0.5} />
                  <Col>
                    <Text b>Buy a giftcard</Text>
                    <Text color="$gray" css={{ lh: "$sm" }}>
                      Select from a range of gift cards.
                    </Text>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Grid>
        </Grid.Container>
      </Row>
      <Spacer y={3}></Spacer>

      <Text h3>Recent tips</Text>
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
                        <Row justify="space-between">
                          <Text color="#F8AF43">
                            <TipStatusBadge status={tip.status} />
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
                            {formatDistance(Date.now(), new Date(tip.created))}{" "}
                            ago
                          </Text>
                          <Text>{tip.amount} sats</Text>
                        </Row>
                        {/* <Row justify="space-between" align="center">

                          <Spacer x={0.25} />
                          
                        </Row>
                        <Spacer y={0.5} />
                        <Row justify="space-between" align="center">
                          <Text small>
                            
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
                        </Row> */}
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
