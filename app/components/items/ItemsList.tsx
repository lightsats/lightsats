import { Collapse, CSS, Spacer } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { ItemCard } from "components/items/ItemCard";
import {
  getOtherItems,
  getRecommendedItems,
} from "lib/items/getRecommendedItems";
import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import React from "react";
import useSWR from "swr";
import { ItemCategory } from "types/Item";

type ItemsListProps = {
  category: ItemCategory;
  checkTippeeBalance: boolean;
};

const collapseGroupCss: CSS = { px: 0, width: "100%" };

export function ItemsList({ category, checkTippeeBalance }: ItemsListProps) {
  const session = useSession();
  const { data: tips } = useSWR<Tip[]>(
    checkTippeeBalance && session ? `/api/tippee/tips` : null,
    defaultFetcher
  );

  const receivedTips = React.useMemo(
    () =>
      tips?.filter(
        (tip) => tip.status === "CLAIMED" || tip.status === "WITHDRAWN"
      ),
    [tips]
  );

  const recommendedItems = React.useMemo(
    () =>
      getRecommendedItems(
        category,
        "en",
        receivedTips?.length
          ? receivedTips.map((tip) => tip.amount).reduce((a, b) => a + b)
          : 0,
        checkTippeeBalance
      ),
    [category, receivedTips, checkTippeeBalance]
  );
  const otherItems = React.useMemo(
    () => getOtherItems(category, recommendedItems),
    [category, recommendedItems]
  );

  return (
    <>
      {otherItems.length > 0 && <h4>Recommended wallets</h4>}
      <Collapse.Group css={collapseGroupCss}>
        {recommendedItems.map((item) => (
          <ItemCard key={item.name} item={item} />
        ))}
      </Collapse.Group>
      {otherItems.length > 0 && (
        <>
          <Spacer />
          <h4>More wallets</h4>
          <Collapse.Group css={collapseGroupCss}>
            {otherItems.map((item) => (
              <ItemCard key={item.name} item={item} />
            ))}
          </Collapse.Group>
        </>
      )}
    </>
  );
}
