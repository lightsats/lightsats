import { PrinterIcon } from "@heroicons/react/24/solid";
import { Button, Container, Loading, Row, Spacer } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { TipHistory } from "components/TipHistory";
import { TippeeSuggestions } from "components/tippee/TippeeSuggestions";
import { NewTipButton } from "components/tipper/NewTipButton";
import { ReturnedTips } from "components/tipper/ReturnedTips";
import { UserCard } from "components/UserCard";
import { useUser } from "hooks/useUser";
import { getStaticProps } from "lib/i18n/i18next";
import { PageRoutes } from "lib/PageRoutes";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";

const Dashboard: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const { data: user } = useUser();

  if (sessionStatus === "loading" || (session && !user)) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡</title>
      </Head>
      {session && user && (
        <Container
          xs
          justify="flex-start"
          alignItems="center"
          display="flex"
          direction="column"
          fluid
          css={{
            padding: 0,
          }}
        >
          <UserCard userId={user.id} showViewButton showAchievements />
          <Spacer />
          {user?.userType === "tipper" ? (
            <>
              <Row justify="center" align="center">
                <NewTipButton />
              </Row>
              <Spacer y={0.5} />
              <Row justify="center" align="center">
                <NextLink href={`${PageRoutes.tipGroups}/empty/print`}>
                  <a>
                    <Button bordered size="sm">
                      <Icon>
                        <PrinterIcon />
                      </Icon>
                      &nbsp;Print Cards
                    </Button>
                  </a>
                </NextLink>
              </Row>
              <Spacer />
              <ReturnedTips />
            </>
          ) : (
            <>
              <Spacer />
              <TippeeSuggestions />
            </>
          )}
          <Spacer />
          <TipHistory />
        </Container>
      )}
    </>
  );
};

export default Dashboard;

export { getStaticProps };
