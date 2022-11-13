import { Card, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { NextLink } from "components/NextLink";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import { formatDistance } from "date-fns";
import { usePagination } from "hooks/usePagination";
import { Routes } from "lib/Routes";

type AdminTipsListProps = {
  tips: Tip[];
};

export function AdminTipsList({ tips }: AdminTipsListProps) {
  const { pageItems, paginationComponent } = usePagination(tips);

  return (
    <>
      {paginationComponent}
      {paginationComponent ? <Spacer /> : undefined}
      <Grid.Container justify="center" gap={1}>
        {pageItems.map((tip) => (
          <Grid key={tip.id} xs={12}>
            <NextLink href={`${Routes.adminTips}/${tip.id}`} passHref>
              <a style={{ width: "100%" }}>
                <Card isPressable isHoverable>
                  <Card.Body>
                    <Row justify="space-between">
                      <Text b>{tip.id}</Text>

                      <TipStatusBadge status={tip.status} />
                    </Row>
                    <Row justify="space-between">
                      <Text>
                        {formatDistance(new Date(), new Date(tip.created))} ago
                      </Text>
                      <Text>
                        {tip.amount}⚡ ({tip.fee} sats fee)
                      </Text>
                    </Row>
                  </Card.Body>
                </Card>
              </a>
            </NextLink>
          </Grid>
        ))}
      </Grid.Container>
    </>
  );
}
