import { Grid, Loading, Spacer, Text } from "@nextui-org/react";
import { ClaimedTipCard } from "components/ClaimedTipCard";
import { NextLink } from "components/NextLink";
import { BecomeATipper } from "components/tippee/BecomeATipper";
import { NewTipButton } from "components/tipper/NewTipButton";
import { useUser } from "hooks/useUser";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { hasTipExpired } from "lib/utils";
import { useSession } from "next-auth/react";
import { CSSProperties } from "react";
import useSWR from "swr";
import { PublicTip } from "types/PublicTip";

const cardLinkStyle: CSSProperties = { flex: 1 };

export function ReceivedTips() {
  const { data: session } = useSession();
  const { data: tips } = useSWR<PublicTip[]>(
    session ? `/api/tippee/tips?publicTip=true` : null,
    defaultFetcher
  );
  const { data: user } = useUser();

  if (!tips) {
    return <Loading color="currentColor" size="sm" />;
  }

  if (!tips.length) {
    return (
      <>
        <Text>{"It looks like you haven't received any tips yet."}</Text>
        <Spacer />
        {user?.userType === "tippee" ? (
          <>
            <BecomeATipper />
          </>
        ) : (
          <>
            <NewTipButton />
          </>
        )}
      </>
    );
  }
  return (
    <Grid.Container justify="center" gap={1}>
      {tips.map((tip) => {
        const component = (
          <ClaimedTipCard publicTip={tip} viewing="tipper" showContinueButton />
        );
        const isWithdrawable = !hasTipExpired(tip) && tip.status === "CLAIMED";
        return (
          <Grid xs={12} key={tip.id} justify="center">
            {isWithdrawable ? (
              <NextLink href={Routes.journeyClaimed}>
                <a style={cardLinkStyle}>{component}</a>
              </NextLink>
            ) : (
              component
            )}
          </Grid>
        );
      })}
    </Grid.Container>
  );
}
