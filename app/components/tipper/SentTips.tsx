import { Grid, Loading, Spacer, Text } from "@nextui-org/react";
import { NewTipButton } from "components/tipper/NewTipButton";
import { SentTipCard } from "components/tipper/SentTipCard";
import { useSentTips } from "hooks/useTips";
import { useSession } from "next-auth/react";

export function SentTips() {
  const { data: session } = useSession();
  const { data: tips } = useSentTips();

  if (session && !tips) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      {tips && tips.length > 0 && (
        <Grid.Container justify="center" gap={1}>
          {tips.map((tip) => (
            <SentTipCard tip={tip} key={tip.id} />
          ))}
        </Grid.Container>
      )}
      {!tips ||
        (!tips.length && (
          <>
            <Text>
              {"No tips available yet, let's create your first one now!"}
            </Text>
            <Spacer />
            <NewTipButton />
          </>
        ))}
    </>
  );
}
