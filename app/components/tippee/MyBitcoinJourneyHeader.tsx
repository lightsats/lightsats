import { Progress, Spacer, Text } from "@nextui-org/react";
import { bitcoinJourneyPages } from "lib/Routes";
import { useRouter } from "next/router";

export function MyBitcoinJourneyHeader() {
  const router = useRouter();
  console.log("router.pathname", router.pathname);
  const progress =
    ((bitcoinJourneyPages.findIndex((route) => {
      console.log(router.pathname, route, router.pathname.indexOf(route) > -1);
      return router.pathname.indexOf(route) > -1;
    }) +
      1) /
      bitcoinJourneyPages.length) *
    100;

  return (
    <>
      <Text size="small" b>
        My Bitcoin Journey
      </Text>
      <Spacer y={0.5} />
      <Progress value={progress} color="success" status="success" />
      <Spacer />
    </>
  );
}
