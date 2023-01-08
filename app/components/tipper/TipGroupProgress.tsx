import { TipGroupWithTips } from "types/TipGroupWithTips";

export function TipGroupProgress({ tipGroup }: { tipGroup: TipGroupWithTips }) {
  const steps = ["UNCLAIMED", "CLAIMED", "WITHDRAWN"];

  return (
    <>
      {/* <Card>
        <Card.Header>Journey summary</Card.Header>
        <Card.Body>
          {steps.map((x) => {
            const currentTipGroup = tipGroup.tips.filter((y) => y.status === x);
            return (
              <Col>
                <Avatar.Group>
                  {currentTipGroup.map((x) => (
                    <Avatar src={getUserAvatarUrl(undefined)} />
                  ))}
                </Avatar.Group>
              </Col>
            );
          })}
        </Card.Body>
      </Card> */}
    </>
    // <Col
    //   css={{
    //     background:
    //       tipGroup.status === "UNFUNDED"
    //         ? "$error"
    //         : `linear-gradient(90deg, $gray 0%, $gray ${
    //             (numOtherTips / tipGroup.tips.length) * 100
    //           }%, $warning ${
    //             (numOtherTips / tipGroup.tips.length) * 100
    //           }%, $warning ${
    //             ((numOtherTips + numUnclaimedTips) / tipGroup.tips.length) * 100
    //           }%, $primary ${
    //             ((numOtherTips + numUnclaimedTips) / tipGroup.tips.length) * 100
    //           }%, $primary ${
    //             ((numOtherTips + numUnclaimedTips + numClaimedTips) /
    //               tipGroup.tips.length) *
    //             100
    //           }%, $success ${
    //             ((numOtherTips + numUnclaimedTips + numClaimedTips) /
    //               tipGroup.tips.length) *
    //             100
    //           }%, $success 100%)`,
    //     width: "100%",
    //     mx: "$5",
    //     height: "12px",
    //     borderRadius: "$base",
    //   }}
    // />
  );
}
