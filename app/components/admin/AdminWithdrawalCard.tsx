import { Card } from "@nextui-org/react";
import { Withdrawal } from "@prisma/client";
import { NextLink } from "components/NextLink";
import { Routes } from "lib/Routes";

type AdminWithdrawalCardProps = {
  withdrawal: Withdrawal;
};

export function AdminWithdrawalCard({ withdrawal }: AdminWithdrawalCardProps) {
  return (
    <NextLink href={`${Routes.adminWithdrawals}/${withdrawal.id}`} passHref>
      <a style={{ width: "100%" }}>
        <Card isPressable isHoverable>
          <Card.Body>{withdrawal.id}</Card.Body>
        </Card>
      </a>
    </NextLink>
  );
}
