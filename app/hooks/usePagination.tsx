import { Pagination } from "@nextui-org/react";
import { DEFAULT_PAGE_SIZE } from "lib/constants";
import React from "react";

type UsePaginationResult<T> = {
  pageItems: T[];
  paginationComponent: React.ReactNode | undefined;
};

export function usePagination<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = React.useState(1);
  const pageItems = React.useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [page, items, pageSize]
  );
  const result: UsePaginationResult<T> = React.useMemo(
    () => ({
      pageItems,
      paginationComponent:
        items.length > pageSize ? (
          <>
            <Pagination
              onChange={setPage}
              total={Math.ceil(items.length / pageSize)}
              initialPage={1}
            />
          </>
        ) : undefined,
    }),
    [items.length, pageItems, pageSize]
  );
  return result;
}
