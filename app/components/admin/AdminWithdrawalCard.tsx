import { Card, Col, Row, Text } from "@nextui-org/react";
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
  return (
    <NextLink href={`${Routes.adminWithdrawals}/${withdrawal.id}`} passHref>
      <a style={{ width: "100%" }}>
        <Card isPressable isHoverable css={{ dropShadow: "$sm" }}>
          <Card.Body>
            <Row justify="space-between">
              <Col>
                <Text>{withdrawal.id}</Text>
                <Text>
                  {withdrawal.tips.length
                    ? withdrawal.tips
                        .map((tip) => tip.amount)
                        .reduce((a, b) => a + b)
                    : 0}{" "}
                  sats
                </Text>
              </Col>
              <NextUIUser
                name={withdrawal.user.name ?? DEFAULT_NAME}
                src={getUserAvatarUrl(withdrawal.user)}
              />
            </Row>
          </Card.Body>
        </Card>
      </a>
    </NextLink>
  );
}
