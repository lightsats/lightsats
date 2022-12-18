import { Button, Col, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Tip, TipStatus } from "@prisma/client";
import { AdminTipCard } from "components/admin/AdminTipCard";
import { Paginated, PaginatedPageProps } from "components/Paginated";
import { hasTipExpired } from "lib/utils";
import React from "react";
import create from "zustand";

type AdminTipsListProps = {
  tips: Tip[];
};

enum ExpiredType {
  Expired = "Expired",
  NotExpired = "NotExpired",
}

const TipSortTypes = ["date", "price"] as const;
type TipsSortType = typeof TipSortTypes[number];
type TipFilter = TipStatus | ExpiredType;
const TipFilters: TipFilter[] = (
  Object.values(ExpiredType) as TipFilter[]
).concat(Object.values(TipStatus) as TipFilter[]);

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
  filters: [],
  setSortType: (sortType: TipsSortType) => set(() => ({ sortType })),
  setSortDirection: (sortDirection: SortDirectionType) =>
    set(() => ({ sortDirection })),
  setFilters: (filters: TipFilter[]) => set(() => ({ filters })),
}));

export function AdminTipsList({ tips }: AdminTipsListProps) {
  const tipsStore = useAdminTipsStore();

  const sortedAndFilteredTips = React.useMemo(() => {
    const tipStatusFilters = tipsStore.filters.filter(
      (filter) => Object.values(TipStatus).indexOf(filter as TipStatus) > -1
    );
    const tipExpiryFilters = tipsStore.filters.filter(
      (filter) => Object.values(ExpiredType).indexOf(filter as ExpiredType) > -1
    );
    return tips
      .filter(
        (tip) =>
          !tipsStore.filters.length ||
          ((!tipStatusFilters.length ||
            tipStatusFilters.indexOf(tip.status) > -1) &&
            (!tipExpiryFilters.length ||
              (tipExpiryFilters.indexOf(ExpiredType.Expired) > -1 &&
                hasTipExpired(tip)) ||
              (tipExpiryFilters.indexOf(ExpiredType.NotExpired) > -1 &&
                !hasTipExpired(tip))))
      )

      .sort((a, b) => {
        let diff = 0;
        if (tipsStore.sortType === "date") {
          diff = new Date(a.created).getTime() - new Date(b.created).getTime();
        } else {
          diff = a.amount - b.amount;
        }
        return tipsStore.sortDirection === "desc" ? -diff : diff;
      });
  }, [tips, tipsStore]);

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
      <Paginated items={sortedAndFilteredTips} Render={AdminTipsListPage} />
    </>
  );
}

function AdminTipsListPage({ pageItems }: PaginatedPageProps<Tip>) {
  return (
    <Grid.Container justify="center" gap={1}>
      {pageItems.map((tip) => (
        <Grid key={tip.id} xs={12}>
          <AdminTipCard tip={tip} />
        </Grid>
      ))}
    </Grid.Container>
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
          {TipFilters.map((tipFilter) => (
            <Grid key={tipFilter}>
              <Button
                auto
                bordered={tipsStore.filters.indexOf(tipFilter) < 0}
                onClick={() => {
                  const isAlreadySelected =
                    tipsStore.filters.indexOf(tipFilter) > -1;
                  const otherFilters = tipsStore.filters.filter(
                    (f) => f !== tipFilter
                  );
                  useAdminTipsStore
                    .getState()
                    .setFilters([
                      ...otherFilters,
                      ...(isAlreadySelected ? [] : [tipFilter]),
                    ]);
                }}
                size="sm"
              >
                {tipFilter}
              </Button>
            </Grid>
          ))}
        </Grid.Container>
      </Row>
    </Col>
  );
}
