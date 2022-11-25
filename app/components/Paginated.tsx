import { Spacer } from "@nextui-org/react";
import { usePagination } from "hooks/usePagination";
import { DEFAULT_PAGE_SIZE } from "lib/constants";

export type PaginatedPageProps<T> = {
  pageItems: T[];
};

export type PaginatedProps<T> = {
  items: T[];
  pageSize?: number;
  Render: ({ pageItems }: PaginatedPageProps<T>) => JSX.Element;
};

export function Paginated<T>({
  Render,
  items,
  pageSize = DEFAULT_PAGE_SIZE,
}: PaginatedProps<T>) {
  const { pageItems, paginationComponent } = usePagination(items, pageSize);
  return (
    <>
      {paginationComponent}
      {paginationComponent ? <Spacer /> : undefined}
      <Render pageItems={pageItems} />
      {paginationComponent && pageItems.length === pageSize ? (
        <Spacer />
      ) : undefined}
      {pageItems.length === pageSize ? paginationComponent : undefined}
    </>
  );
}
