import { Card, Col, Row, Text } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { NextUIUser } from "components/NextUIUser";
import { DEFAULT_NAME } from "lib/constants";
import { Routes } from "lib/Routes";
import { getUserAvatarUrl } from "lib/utils";
import { AdminExtendedWithdrawalError } from "types/Admin";

type AdminWithdrawalErrorCardProps = {
  withdrawalError: AdminExtendedWithdrawalError;
};

export function AdminWithdrawalErrorCard({
  withdrawalError,
}: AdminWithdrawalErrorCardProps) {
  return (
    <NextLink
      href={`${Routes.adminWithdrawalErrors}/${withdrawalError.id}`}
      passHref
    >
      <a style={{ width: "100%" }}>
        <Card isPressable isHoverable css={{ dropShadow: "$sm" }}>
          <Card.Body>
            <Row justify="space-between">
              <Col>
                <Text>{withdrawalError.id}</Text>
                <Text>{new Date(withdrawalError.created).toISOString()}</Text>
                <Text css={{ wordBreak: "break-word" }}>
                  {withdrawalError.message}
                </Text>
              </Col>
              <NextUIUser
                name={withdrawalError.user.name ?? DEFAULT_NAME}
                src={getUserAvatarUrl(withdrawalError.user)}
              />
            </Row>
          </Card.Body>
        </Card>
      </a>
    </NextLink>
  );
}
