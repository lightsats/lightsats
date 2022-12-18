import { Card } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { AdminTipCardContents } from "components/admin/AdminTipCardContents";
import { NextLink } from "components/NextLink";
import { PageRoutes } from "lib/PageRoutes";

type AdminTipCardProps = {
  tip: Tip;
};

export function AdminTipCard({ tip }: AdminTipCardProps) {
  return (
    <NextLink href={`${PageRoutes.adminTips}/${tip.id}`} passHref>
      <a style={{ width: "100%" }}>
        <Card isPressable isHoverable css={{ dropShadow: "$sm" }}>
          <Card.Body>
            <AdminTipCardContents tip={tip} />
          </Card.Body>
        </Card>
      </a>
    </NextLink>
  );
}
