import { Card, Row } from "@nextui-org/react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function Alert(props: Props) {
  return (
    <Card
      color="$warning"
      css={{
        dropShadow: "$sm",
        backgroundColor: "$warningLight",
        borderColor: "$warningBorder",
      }}
    >
      <Card.Body>
        <Row justify="center">{props.children}</Row>
      </Card.Body>
    </Card>
  );
}
