import { Container, Loading, Spacer } from "@nextui-org/react";
import { TipHistory } from "components/TipHistory";
import { TippeeSuggestions } from "components/tippee/TippeeSuggestions";
import { NewTipButton } from "components/tipper/NewTipButton";
import { ReturnedTips } from "components/tipper/ReturnedTips";
import { UserCard } from "components/UserCard";
import { useUser } from "hooks/useUser";
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
          <UserCard userId={user.id} showViewButton />
          <Spacer />
          {user?.userType === "tipper" ? (
            <>
              <NewTipButton />
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
