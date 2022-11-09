import { Row } from "@nextui-org/react";

export function Divider() {
  return (
    <Row css={{ py: 10 }}>
      <Row css={{ background: "$accents0", height: "1px" }} />
    </Row>
  );
}
