import { Card, Row, Spacer, Text } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { NextUIUser } from "components/NextUIUser";
import { DEFAULT_NAME } from "lib/constants";
import { Routes } from "lib/Routes";
import { getUserAvatarUrl } from "lib/utils";
import { AdminExtendedWithdrawal } from "types/Admin";

type AdminWithdrawalCardProps = {
  withdrawal: AdminExtendedWithdrawal;
};

export function AdminWithdrawalCard({ withdrawal }: AdminWithdrawalCardProps) {
  const amount = withdrawal.tips.length
    ? withdrawal.tips.map((tip) => tip.amount).reduce((a, b) => a + b)
    : 0;

  const tipFees = withdrawal.tips.length
    ? withdrawal.tips.map((tip) => tip.fee).reduce((a, b) => a + b)
    : 0;
  return (
    <NextLink href={`${Routes.adminWithdrawals}/${withdrawal.id}`} passHref>
      <a style={{ width: "100%" }}>
        <Card isPressable isHoverable css={{ dropShadow: "$sm" }}>
          <Card.Body>
            <Row justify="space-between" align="center">
              <Text>{withdrawal.id}</Text>
              <Text>{withdrawal.tips.length} tips</Text>

              <NextUIUser
                name={withdrawal.user.name ?? DEFAULT_NAME}
                src={getUserAvatarUrl(withdrawal.user)}
              />
            </Row>
            <Spacer />
            <Row justify="space-between">
              <Text>Method: {withdrawal.withdrawalMethod}</Text>
              <Text>Amount: {amount} sats</Text>
              <Text>Fees: {tipFees} sats</Text>
            </Row>
            <Spacer />
            <Row align="center" justify="space-between">
              <Text>Outbound Routing Fee: {withdrawal.routingFee} sats</Text>
              <Text>Profit: {tipFees - withdrawal.routingFee} sats</Text>
              <Text size="small">
                {new Date(withdrawal.created).toISOString()}
              </Text>
            </Row>
          </Card.Body>
        </Card>
      </a>
    </NextLink>
  );
}
