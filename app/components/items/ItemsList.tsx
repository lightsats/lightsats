import { Collapse, CSS, Spacer, Text } from "@nextui-org/react";
import { ItemCard } from "components/items/ItemCard";
import { useReceivedTips } from "hooks/useTips";
import {
  getOtherItems,
  getRecommendedItems,
} from "lib/items/getRecommendedItems";
import React from "react";
import { ItemCategory } from "types/Item";

type ItemsListProps = {
  category: ItemCategory;
  checkTippeeBalance: boolean;
};

const collapseGroupCss: CSS = { width: "100%" };

export function ItemsList({ category, checkTippeeBalance }: ItemsListProps) {
  const { data: tips } = useReceivedTips();

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
      {otherItems.length > 0 && <h4>Recommended wallet</h4>}

      <Collapse.Group shadow css={collapseGroupCss}>
        {recommendedItems.map((item) => (
          <ItemCard
            key={item.name}
            item={item}
            expanded={recommendedItems.length === 1}
          />
        ))}
      </Collapse.Group>

      {otherItems.length > 0 && (
        <>
          <Spacer />

          <Text small b h4 transform="uppercase">
            Other wallets
          </Text>
          <Collapse.Group shadow css={collapseGroupCss}>
            {otherItems.map((item) => (
              <ItemCard key={item.name} item={item} />
            ))}
          </Collapse.Group>
        </>
      )}
    </>
  );
}
