import { Card } from "@nextui-org/react";
import { User } from "@prisma/client";
import { NextLink } from "components/NextLink";
import { NextUIUser } from "components/NextUIUser";
import { DEFAULT_NAME } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
import { getUserAvatarUrl } from "lib/utils";

type AdminUserCardProps = {
  user: User;
};

export function AdminUserCard({ user }: AdminUserCardProps) {
  return (
    <NextLink href={`${PageRoutes.adminUsers}/${user.id}`} passHref>
      <a style={{ width: "100%" }}>
        <Card isPressable isHoverable css={{ dropShadow: "$sm" }}>
          <Card.Body>
            <NextUIUser
              name={user.name ?? DEFAULT_NAME}
              src={getUserAvatarUrl(user)}
            />
          </Card.Body>
        </Card>
      </a>
    </NextLink>
  );
}
