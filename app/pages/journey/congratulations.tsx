import { Spacer, Text } from "@nextui-org/react";
import { MyBitcoinJourneyContent } from "components/tippee/MyBitcoinJourneyContent";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { confetti } from "dom-confetti";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

const CongratulationsPage: NextPage = () => {
  const confettiRef = React.useRef(null);
  React.useEffect(() => {
    if (confettiRef.current) {
      confetti(confettiRef.current, { elementCount: 100 });
    }
  }, [confettiRef]);
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Congratulations</title>
      </Head>
      <MyBitcoinJourneyHeader />
      <MyBitcoinJourneyContent>
        <h2>You did it 🎉</h2>
        <Spacer />
        <div
          style={{
            position: "fixed",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
          }}
        >
          <div ref={confettiRef}></div>
        </div>

        <Text>You are a proud new owner of a fraction of a bitcoin.</Text>
        <Spacer />
        <Text blockquote>
          Rumors say - those who are gifted some bitcoin are a very special kind
          of people.
        </Text>
        <Spacer />
      </MyBitcoinJourneyContent>

      <Spacer />
      <MyBitcoinJourneyFooter href={Routes.guide} text={"What's Next?"} />
    </>
  );
};

export default CongratulationsPage;
