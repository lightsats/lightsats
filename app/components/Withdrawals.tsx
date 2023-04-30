import { Col, Collapse, Grid, Loading, Spacer, Text } from "@nextui-org/react";
import { WithdrawalMethod } from "@prisma/client";
import { ClaimedTipCard } from "components/ClaimedTipCard";
import { formatDistance } from "date-fns";
import { useWithdrawals } from "hooks/useWithdrawals";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export function Withdrawals() {
  const { data: session } = useSession();
  const { data: withdrawals } = useWithdrawals();
  const router = useRouter();
  const { withdrawalId } = router.query;

  if (!withdrawals) {
    return <Loading />;
  }

  if (!withdrawals.length) {
    return (
      <>
        <Text>{"It looks like you haven't made any withdrawals yet."}</Text>
        <Spacer />
      </>
    );
  }

  return (
    <Grid.Container justify="center" gap={1}>
      {withdrawals.map((withdrawal) => {
        return (
          <Grid xs={12} key={withdrawal.id} justify="center">
            <Collapse
              css={{
                width: "100%",
                dropShadow: "$sm",
                border: "none",
                px: "$10",
                ":last-child": {
                  overflow: "visible", // fix nextui collapse content getting cut off
                },
                backgroundColor:
                  withdrawal.id === withdrawalId ? "$green100" : undefined,
              }}
              title={
                <Col>
                  <Text id={`withdrawal-${withdrawal.id}`}>
                    ⚡
                    {withdrawal.tips
                      .map((tip) => tip.amount)
                      .reduce((a, b) => a + b, 0)}
                  </Text>
                  <Text small>
                    {formatDistance(new Date(withdrawal.created), Date.now(), {
                      addSuffix: true,
                    })}{" "}
                    • {withdrawal.tips.length} tips •{" "}
                    {getWithdrawalMethodDescription(
                      withdrawal.withdrawalMethod
                    )}
                  </Text>
                </Col>
              }
              shadow
            >
              <Grid.Container justify="center" gap={1}>
                {withdrawal.tips.map((tip) => (
                  <Grid xs={12} key={tip.id} justify="center">
                    <ClaimedTipCard
                      publicTip={tip}
                      viewing={
                        tip.tipperId === session?.user.id ? "tippee" : "tipper"
                      }
                    />
                  </Grid>
                ))}
              </Grid.Container>
            </Collapse>
          </Grid>
        );
      })}
    </Grid.Container>
  );
}

function getWithdrawalMethodDescription(withdrawalMethod: WithdrawalMethod) {
  switch (withdrawalMethod) {
    case "invoice":
      return "Manual invoice";
    case "lightning_address":
      return "Automatically sent to your Lightning Address";
    case "lnurlw":
      return "LNURL withdraw";
    case "webln":
      return "WebLN withdrawal";
  }
}
