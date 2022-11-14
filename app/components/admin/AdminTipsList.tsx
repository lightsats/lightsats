import { Button, Card, Col, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Tip, TipStatus } from "@prisma/client";
import { NextLink } from "components/NextLink";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import { formatDistance } from "date-fns";
import { usePagination } from "hooks/usePagination";
import { DEFAULT_PAGE_SIZE } from "lib/constants";
import { Routes } from "lib/Routes";
import React from "react";
import create from "zustand";

type AdminTipsListProps = {
  tips: Tip[];
};

const TipSortTypes = ["date", "price"] as const;
type TipsSortType = typeof TipSortTypes[number];
type TipFilter = TipStatus;

const SortDirectionTypes = ["asc", "desc"] as const;
type SortDirectionType = typeof SortDirectionTypes[number];

type AdminTipsStore = {
  sortType: TipsSortType;
  sortDirection: SortDirectionType;
  filters: TipFilter[];
  setSortType(sortType: TipsSortType): void;
  setSortDirection(sortDirection: SortDirectionType): void;
  setFilters(filters: TipFilter[]): void;
};

const useAdminTipsStore = create<AdminTipsStore>((set) => ({
  sortType: "date",
  sortDirection: "desc",
  filters: Object.values(TipStatus),
  setSortType: (sortType: TipsSortType) => set(() => ({ sortType })),
  setSortDirection: (sortDirection: SortDirectionType) =>
    set(() => ({ sortDirection })),
  setFilters: (filters: TipFilter[]) => set(() => ({ filters })),
}));

export function AdminTipsList({ tips }: AdminTipsListProps) {
  const tipsStore = useAdminTipsStore();
  const sortedAndFilteredTips = React.useMemo(
    () =>
      tips
        .filter(
          (tip) =>
            !tipsStore.filters.length ||
            tipsStore.filters.indexOf(tip.status) > -1
        )
        .sort((a, b) => {
          let diff = 0;
          if (tipsStore.sortType === "date") {
            diff =
              new Date(a.created).getDate() - new Date(b.created).getDate();
          } else {
            diff = a.amount - b.amount;
          }
          return tipsStore.sortDirection === "desc" ? -diff : diff;
        }),
    [tips, tipsStore]
  );

  const { pageItems, paginationComponent } = usePagination(
    sortedAndFilteredTips,
    DEFAULT_PAGE_SIZE
  );

  return (
    <>
      <SortFilterTips />
      <Text>
        Filtered {sortedAndFilteredTips.length} / {tips.length} tips (
        {sortedAndFilteredTips.length
          ? sortedAndFilteredTips.map((t) => t.amount).reduce((a, b) => a + b)
          : 0}{" "}
        sats)
      </Text>
      <Spacer />
      {paginationComponent}
      {paginationComponent ? <Spacer /> : undefined}
      <Grid.Container justify="center" gap={1}>
        {pageItems.map((tip) => (
          <Grid key={tip.id} xs={12}>
            <NextLink href={`${Routes.adminTips}/${tip.id}`} passHref>
              <a style={{ width: "100%" }}>
                <Card isPressable isHoverable css={{ dropShadow: "$sm" }}>
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
      {paginationComponent && pageItems.length === DEFAULT_PAGE_SIZE ? (
        <Spacer />
      ) : undefined}
      {pageItems.length === DEFAULT_PAGE_SIZE ? paginationComponent : undefined}
    </>
  );
}

function SortFilterTips() {
  const tipsStore = useAdminTipsStore();
  return (
    <Col>
      <Row align="center" css={{ gap: 10 }}>
        <Text h6>Sort</Text>
        {TipSortTypes.map((sortType) => (
          <Button
            auto
            size="sm"
            bordered={tipsStore.sortType !== sortType}
            onClick={() => useAdminTipsStore.getState().setSortType(sortType)}
            key={sortType}
          >
            {sortType}
          </Button>
        ))}
      </Row>
      <Spacer />
      <Row align="center" css={{ gap: 10 }}>
        <Text h6>Sort Direction</Text>
        {SortDirectionTypes.map((sortDirection) => (
          <Button
            auto
            bordered={tipsStore.sortDirection !== sortDirection}
            onClick={() =>
              useAdminTipsStore.getState().setSortDirection(sortDirection)
            }
            size="sm"
            key={sortDirection}
          >
            {sortDirection}
          </Button>
        ))}
      </Row>
      <Spacer />
      <Row>
        <Text h6>Filter</Text>
        <Grid.Container gap={1}>
          {Object.values(TipStatus).map((tipStatus) => (
            <Grid key={tipStatus}>
              <Button
                auto
                bordered={tipsStore.filters.indexOf(tipStatus) < 0}
                onClick={() => {
                  const isAlreadySelected =
                    tipsStore.filters.indexOf(tipStatus) > -1;
                  const otherFilters = tipsStore.filters.filter(
                    (f) => f !== tipStatus
                  );
                  useAdminTipsStore
                    .getState()
                    .setFilters([
                      ...otherFilters,
                      ...(isAlreadySelected ? [] : [tipStatus]),
                    ]);
                }}
                size="sm"
              >
                {tipStatus}
              </Button>
            </Grid>
          ))}
        </Grid.Container>
      </Row>
    </Col>
  );
}
