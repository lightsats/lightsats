import { Card } from "@nextui-org/react";
import { AdminTipGroupCardContents } from "components/admin/AdminTipGroupCardContents";
import { NextLink } from "components/NextLink";
import { PageRoutes } from "lib/PageRoutes";
import { TipGroupWithTips } from "types/TipGroupWithTips";

type AdminTipGroupCardProps = {
  tipGroup: TipGroupWithTips;
};

export function AdminTipGroupCard({ tipGroup }: AdminTipGroupCardProps) {
  return (
    <NextLink href={`${PageRoutes.adminTipGroups}/${tipGroup.id}`} passHref>
      <a style={{ width: "100%" }}>
        <Card isPressable isHoverable css={{ dropShadow: "$sm" }}>
          <Card.Body>
            <AdminTipGroupCardContents tipGroup={tipGroup} />
          </Card.Body>
        </Card>
      </a>
    </NextLink>
  );
}
