import { InformationCircleIcon, WalletIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Loading,
  Row,
  Spacer,
  Text,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextImage } from "components/NextImage";
import { NextLink } from "components/NextLink";
import { useSentTips } from "hooks/useTips";
import { useUser } from "hooks/useUser";
import { Routes } from "lib/Routes";
import { useSession } from "next-auth/react";

export function ReturnedTips() {
  const { data: session, status: sessionStatus } = useSession();
  const { data: user } = useUser();

  const { data: tips } = useSentTips();
  const reclaimedTips = tips?.filter((tip) => tip.status === "RECLAIMED");

  if (sessionStatus === "loading" || (session && !user)) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      {reclaimedTips && reclaimedTips.length > 0 && (
        <>
          <Row justify="center">
            <Row align="center">
              <Text css={{ m: 0 }} h5>
                Returned tips
              </Text>
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
          </Row>
          <Card css={{ dropShadow: "$sm", background: "$primary" }}>
            <Card.Body>
              <Row align="center">
                <NextImage
                  src="/images/icons/zap.png"
                  width={150}
                  height={150}
                  alt="zap"
                />
              </Row>
              <Row justify="center">
                <Text
                  size={16}
                  css={{
                    maxWidth: 200,
                    textAlign: "center",
                    color: "$white",
                  }}
                >
                  {"You've got "}
                  <b>
                    {reclaimedTips
                      .map((tip) => tip.amount)
                      .reduce((a, b) => a + b)}{" "}
                    sats
                  </b>{" "}
                  back from reclaimed or expired tips.{" "}
                </Text>
              </Row>
              <Spacer />
              <Row justify="center">
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
          <Spacer />
        </>
      )}
    </>
  );
}
