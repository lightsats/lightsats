import { Button, Card, Row, Spacer, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { BecomeATipper } from "components/tippee/BecomeATipper";
import { ReceivedTips } from "components/tippee/ReceivedTips";
import { SentTips } from "components/tipper/SentTips";
import { useUser } from "hooks/useUser";
import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import React from "react";
import useSWR from "swr";
import { PublicTip } from "types/PublicTip";

const historyTabs = ["sent", "received"] as const;
type HistoryTab = typeof historyTabs[number];

export function TipHistory() {
  const { data: session } = useSession();
  const { data: user } = useUser();
  const [selectedTab, setSelectedTab] = React.useState<HistoryTab>(
    user?.userType === "tipper" ? "sent" : "received"
  );
  const { data: sentTips } = useSWR<Tip[]>(
    session ? "/api/tipper/tips" : null,
    defaultFetcher
  );

  const { data: receivedTips } = useSWR<PublicTip[]>(
    session ? "/api/tippee/tips" : null,
    defaultFetcher
  );

  const tipCounts = [sentTips?.length, receivedTips?.length];

  return (
    <>
      <Row>
        <Text h6>History</Text>
      </Row>
      <Card variant="flat" css={{ backgroundColor: "$accents2" }}>
        <Card.Body css={{ p: 5 }}>
          <Row css={{ gap: 20 }}>
            {historyTabs.map((tab, i) => (
              <Button
                css={{
                  backgroundColor: tab === selectedTab ? "$white" : "$accents2",
                  color: "$black",
                  flex: 1,
                  my: 0,
                  textTransform: "capitalize",
                }}
                size="sm"
                key={tab}
                onClick={() => setSelectedTab(tab)}
              >
                {tab} ({tipCounts[i] ?? 0})
              </Button>
            ))}
          </Row>
        </Card.Body>
      </Card>
      <Spacer />
      {selectedTab === "sent" &&
        (user?.userType === "tipper" ? <SentTips /> : <BecomeATipper />)}
      {selectedTab === "received" && <ReceivedTips />}
    </>
  );
}
