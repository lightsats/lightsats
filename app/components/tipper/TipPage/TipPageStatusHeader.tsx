import { Row, Text } from "@nextui-org/react";
import { TipStatus } from "@prisma/client";

type TipPageStatusHeaderProps = {
  status: TipStatus;
};

export function TipPageStatusHeader({ status }: TipPageStatusHeaderProps) {
  const title = getTitle(status);
  const subtitle = getSubtitle(status);

  return (
    <>
      <Row align="center" justify="center">
        <Text h3>{title}</Text>
      </Row>
      <Row align="center" justify="center">
        <Text weight="medium">{subtitle}</Text>
      </Row>
    </>
  );
}

function getTitle(status: TipStatus) {
  switch (status) {
    case "WITHDRAWN":
      return "You did it 🎉";
    case "UNFUNDED":
      return "You're almost there 👍";
    case "UNCLAIMED":
      return "Your tip is ready for takeoff ✈️";
    default:
      return "Nice work 👍";
  }
}
function getSubtitle(status: TipStatus) {
  switch (status) {
    case "WITHDRAWN":
      return "Your recipient has withdrawn their sats!";
    case "UNFUNDED":
      return "You'll need to fund your tip before it can be sent";
    case "UNCLAIMED":
      return "Your tip hasn't been claimed yet";
    default:
      return "Your recipient is on their 🍊💊 journey!";
  }
}
