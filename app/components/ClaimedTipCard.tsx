import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
  Badge,
  Card,
  Col,
  Loading,
  Progress,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { FiatPrice } from "components/FiatPrice";
import { Icon } from "components/Icon";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import { formatDistanceStrict } from "date-fns";
import { DEFAULT_FIAT_CURRENCY, DEFAULT_NAME } from "lib/constants";
import { bitcoinJourneyPages } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getAvatarUrl } from "lib/utils";
import useSWR from "swr";
import { ExchangeRates } from "types/ExchangeRates";
import { PublicTip } from "types/PublicTip";

type ClaimedTipCardProps = {
  publicTip: PublicTip | undefined;
  viewing: "tipper" | "tippee";
};

export function ClaimedTipCard({ publicTip, viewing }: ClaimedTipCardProps) {
  const { data: exchangeRates } = useSWR<ExchangeRates>(
    `/api/exchange/rates`,
    defaultFetcher
  );

  if (!publicTip) {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }

  const journeyStep = publicTip.tippee ? publicTip.tippee?.journeyStep : 0;
  const viewedUser = publicTip[viewing];

  return (
    <Card css={{ background: "$gray900" }}>
      <Card.Body>
        <Row align="center">
          <Avatar
            src={getAvatarUrl(
              viewedUser?.avatarURL ?? undefined,
              viewedUser?.fallbackAvatarId
            )}
            size="md"
            bordered
          />
          <Spacer x={0.5} />
          <Col>
            <Row>
              <Text b color="white">
                {viewedUser?.name ??
                  (viewing === "tippee" ? publicTip.tippeeName : undefined) ??
                  DEFAULT_NAME}
              </Text>
            </Row>
            <Row>
              <Text color="white">
                {formatDistanceStrict(Date.now(), new Date(publicTip.created))}{" "}
                ago
              </Text>
            </Row>
          </Col>
          <Col>
            <Row justify="flex-end">
              <Text b color="white">
                <FiatPrice
                  currency={publicTip.currency ?? DEFAULT_FIAT_CURRENCY}
                  sats={publicTip.amount}
                  exchangeRate={
                    exchangeRates?.[publicTip.currency ?? DEFAULT_FIAT_CURRENCY]
                  }
                />
              </Text>
            </Row>
            <Row justify="flex-end">
              <Text color="white">{publicTip.amount} sats</Text>
            </Row>
          </Col>
        </Row>
        {publicTip.note && (
          <>
            <Spacer />
            <Card css={{ background: "$black" }}>
              <Card.Body>
                <Row>
                  <Icon color="white">
                    <ChatBubbleOvalLeftIcon />
                  </Icon>
                  <Spacer x={0.5} />
                  <Text color="white">{publicTip.note}</Text>
                </Row>
              </Card.Body>
            </Card>
          </>
        )}
        {viewing === "tippee" && (
          <>
            <Spacer />
            <Progress
              value={(journeyStep / bitcoinJourneyPages.length) * 100}
              status={publicTip.status === "CLAIMED" ? "success" : "warning"}
              color={publicTip.status === "CLAIMED" ? "success" : "warning"}
            />
            <Spacer y={0.5} />
            <Row justify="space-between" align="center">
              <Col>
                <Text color="white" size="small" b>
                  Status
                </Text>
                <Row align="center">
                  {publicTip.status === "CLAIMED" ? (
                    <>
                      <Text color="white" size="small" weight="thin">
                        STEP {journeyStep} OF {bitcoinJourneyPages.length}{" "}
                      </Text>
                      <Spacer x={0.25} />
                      {journeyStep > 0 && (
                        <Text size="small" b css={{ color: "$accents8" }}>
                          {`${bitcoinJourneyPages[
                            journeyStep - 1
                          ].toUpperCase()}`}
                        </Text>
                      )}
                    </>
                  ) : undefined}
                </Row>
              </Col>
              <Row justify="flex-end">
                {publicTip.status === "UNCLAIMED" && (
                  <>
                    <Badge
                      color={publicTip.claimLinkViewed ? "success" : "warning"}
                    >
                      {publicTip.claimLinkViewed ? "SEEN" : "UNSEEN"}
                    </Badge>
                    <Spacer x={0.5} />
                  </>
                )}
                <TipStatusBadge status={publicTip.status} />
              </Row>
            </Row>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
