import { InformationCircleIcon, WalletIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Image,
  Loading,
  Row,
  Spacer,
  Text,
  Tooltip,
} from "@nextui-org/react";
import { Alert } from "components/Alert";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { TipHistory } from "components/TipHistory";
import { TippeeSuggestions } from "components/tippee/TippeeSuggestions";
import { NewTipButton } from "components/tipper/NewTipButton";
import { UserCard } from "components/UserCard";
import { useSentTips } from "hooks/useTips";
import { useUser } from "hooks/useUser";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
const Home: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const { data: user } = useUser();

  const { data: tips } = useSentTips();
  const reclaimedTips = tips?.filter((tip) => tip.status === "RECLAIMED");

  if (sessionStatus === "loading" || (session && !user)) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡</title>
      </Head>

      {user ? (
        <>
          {user?.userType === "tipper" && (
            <>
              <Alert>⚠️ This project is currently in BETA.</Alert>
            </>
          )}
          <Spacer />
          <UserCard userId={user.id} />
          <Spacer />
          {user?.userType === "tipper" ? (
            <>
              <NewTipButton />
              <Spacer />
            </>
          ) : (
            <>
              <Spacer />
              <TippeeSuggestions />
            </>
          )}
          <Spacer />
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
                    <Image src="/images/icons/zap.png" width={150} alt="zap" />
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
          <TipHistory />
        </>
      ) : (
        <>
          <Spacer />
          <Image alt="" src="images/seed.png" width={200} />
          <Text
            size={60}
            h1
            css={{
              textGradient: "45deg, $blue900 -20%, $blue600 50%",
            }}
          >
            Orange pill
          </Text>
          <Text h1 size={30} css={{ marginTop: "-0.5em" }}>
            the world around you.
          </Text>
          <Spacer />
          <NextLink href={Routes.login} passHref>
            <a>
              <Button size="lg">Get started &raquo;</Button>
            </a>
          </NextLink>
        </>
      )}
    </>
  );
};

export default Home;
