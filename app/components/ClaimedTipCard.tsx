import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Loading,
  Progress,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { ExpiryBadge } from "components/ExpiryBadge";
import { FiatPrice } from "components/FiatPrice";
import { Icon } from "components/Icon";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import { formatDistanceStrict } from "date-fns";
import { useExchangeRates } from "hooks/useExchangeRates";
import { DEFAULT_FIAT_CURRENCY, DEFAULT_NAME } from "lib/constants";
import { bitcoinJourneyPages } from "lib/Routes";
import { getAvatarUrl, hasTipExpired } from "lib/utils";
import { PublicTip } from "types/PublicTip";

type ClaimedTipCardProps = {
  publicTip: PublicTip | undefined;
  viewing: "tipper" | "tippee";
  showContinueButton?: boolean;
};

export function ClaimedTipCard({
  publicTip,
  viewing,
  showContinueButton,
}: ClaimedTipCardProps) {
  const { data: exchangeRates } = useExchangeRates();

  if (!publicTip) {
    return <Loading color="currentColor" size="sm" />;
  }

  const journeyStep = publicTip.tippee ? publicTip.tippee?.journeyStep : 0;
  const viewedUser = publicTip[viewing];

  const progressColor =
    publicTip.status === "CLAIMED" || publicTip.status === "WITHDRAWN"
      ? "success"
      : "warning";

  return (
    <Card
      css={{
        dropShadow: "$sm",
        background:
          publicTip.status === "WITHDRAWN"
            ? `url('/images/confetti.svg'), $gray900`
            : "$gray900",
      }}
    >
      <Card.Body>
        <Row align="center">
          <Avatar
            src={getAvatarUrl(
              viewedUser?.avatarURL ?? undefined,
              viewedUser?.fallbackAvatarId
            )}
            size="xl"
            bordered
          />
          <Spacer x={0.5} />
          <Col>
            <Row>
              <Text b color="white" css={{ mr: 10 }}>
                {viewedUser?.name ??
                  (viewing === "tippee" ? publicTip.tippeeName : undefined) ??
                  DEFAULT_NAME}
              </Text>
              {publicTip.status === "CLAIMED" ? (
                <ExpiryBadge tip={publicTip} viewing={viewing} />
              ) : (
                <TipStatusBadge status={publicTip.status} />
              )}
            </Row>
            <Row css={{ mt: 6 }}>
              <Text color="white" small>
                created&nbsp;
                {formatDistanceStrict(
                  Date.now(),
                  new Date(publicTip.created)
                )}{" "}
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
            <Card css={{ background: "#000000AA" }}>
              <Card.Body css={{ padding: "$sm" }}>
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
              status={progressColor}
              color={progressColor}
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
                      <Text
                        color="white"
                        size="small"
                        weight="thin"
                        transform="uppercase"
                      >
                        Step {journeyStep} of {bitcoinJourneyPages.length}{" "}
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
                      variant="flat"
                      color={publicTip.claimLinkViewed ? "success" : "warning"}
                    >
                      {publicTip.claimLinkViewed ? "👀 SEEN" : "🙈 UNSEEN"}
                    </Badge>
                    <Spacer x={0.5} />
                  </>
                )}
                <TipStatusBadge status={publicTip.status} />
              </Row>
            </Row>
          </>
        )}
        {showContinueButton &&
          publicTip.status === "CLAIMED" &&
          !hasTipExpired(publicTip) && (
            <>
              <Spacer />
              <Row justify="flex-end">
                <Button size="sm" auto>
                  Withdraw&nbsp;🚀
                </Button>
              </Row>
            </>
          )}
      </Card.Body>
    </Card>
  );
}
