import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
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
  isTipper?: boolean;
};

export function ClaimedTipCard({
  publicTip,
  isTipper = false,
}: ClaimedTipCardProps) {
  const { data: exchangeRates } = useSWR<ExchangeRates>(
    `/api/exchange/rates`,
    defaultFetcher
  );

  if (!publicTip) {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }

  const journeyStep = publicTip.tippee ? publicTip.tippee?.journeyStep : 0;

  return (
    <Card css={{ background: "$gray900" }}>
      <Card.Body>
        <Row align="center">
          <Avatar
            src={getAvatarUrl(
              (!isTipper
                ? publicTip.tipper.avatarURL
                : publicTip.tippee?.avatarURL) ?? undefined,
              !isTipper
                ? publicTip.tipper.fallbackAvatarId
                : publicTip.tippee?.fallbackAvatarId
            )}
            size="md"
            bordered
          />
          <Spacer x={0.5} />
          <Col>
            <Row>
              <Text b color="white">
                {(!isTipper
                  ? publicTip.tipper.name
                  : publicTip.tippee?.name ?? publicTip.tippeeName) ??
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
        {isTipper && (
          <>
            <Spacer />
            <Progress
              value={(journeyStep / bitcoinJourneyPages.length) * 100}
              color="success"
              status="success"
            />
            <Spacer y={0.5} />
            <Row justify="space-between" align="center">
              <Col>
                <Text color="white" size="small" b>
                  Status
                </Text>
                <Row align="center">
                  <Text color="white" size="small" weight="thin">
                    STEP {journeyStep} OF {bitcoinJourneyPages.length}{" "}
                  </Text>
                  <Spacer x={0.25} />
                  {journeyStep > 0 && (
                    <Text size="small" b css={{ color: "$accents8" }}>
                      {`${bitcoinJourneyPages[journeyStep - 1].toUpperCase()}`}
                    </Text>
                  )}
                </Row>
              </Col>
              <TipStatusBadge status={publicTip.status} />
            </Row>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
