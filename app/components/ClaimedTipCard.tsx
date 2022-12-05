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
import {
  DEFAULT_FIAT_CURRENCY,
  DEFAULT_NAME,
  expirableTipStatuses,
} from "lib/constants";
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
      isHoverable
      isPressable
      css={{
        dropShadow: "$sm",
        position: "relative",
        "&::after": {
          content: "",
          background: "url('/images/confetti.svg')",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          position: "absolute",
          zIndex: -1,
          opacity: 0.3,
        },
        background: "$gray900",
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
              {expirableTipStatuses.indexOf(publicTip.status) > -1 ? (
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
              value={
                publicTip.status === "WITHDRAWN"
                  ? 100
                  : (journeyStep / bitcoinJourneyPages.length) * 100
              }
              status={progressColor}
              color={progressColor}
            />
            <Spacer y={0.5} />
            <Row justify="space-between" align="flex-start">
              <div>
                <Text color="white" size="small" b>
                  Status
                </Text>
                {publicTip.status === "CLAIMED" ? (
                  <>
                    <Text color="white" size="small" transform="uppercase">
                      Step {journeyStep} of {bitcoinJourneyPages.length}{" "}
                    </Text>
                  </>
                ) : undefined}
              </div>
              <div>
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
              </div>
            </Row>
            <Row>
              {publicTip.status === "CLAIMED" ? (
                <>
                  {journeyStep > 0 && (
                    <Text small css={{ color: "$accents7" }}>
                      {`${bitcoinJourneyPages[journeyStep - 1]
                        .toUpperCase()
                        .substring(1)
                        .replaceAll("/", " ➡️ ")}`}
                    </Text>
                  )}
                </>
              ) : undefined}
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
