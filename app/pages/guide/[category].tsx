import { Loading, Text } from "@nextui-org/react";
import { ItemsList } from "components/items/ItemsList";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { catalog } from "lib/items/catalog";
import { CategoryFilterOptions } from "lib/items/getRecommendedItems";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { ItemCategory } from "types/Item";

const GuideCategoryPage: NextPage = () => {
  const router = useRouter();
  const { category: categoryString } = router.query;
  const category = categoryString as ItemCategory;

  const categoryFilterOptions: CategoryFilterOptions = React.useMemo(
    () => ({
      recommendedLimit: category === "wallets" ? 1 : undefined,
    }),
    [category]
  );

  if (!category) {
    return <Loading color="currentColor" size="sm" />;
  }

  const categoryItems = catalog[category];

  return (
    <>
      <Head>
        <title>Lightsats⚡ - {category} Guide</title>
      </Head>
      <Text h3>{category[0].toUpperCase() + category.slice(1)}</Text>
      {categoryItems?.length ? (
        <ItemsList category={category} options={categoryFilterOptions} />
      ) : (
        <>
          <Text css={{ textAlign: "center" }}>
            {
              "It looks like we haven't added any services to this category yet. Please check back soon."
            }{" "}
          </Text>
        </>
      )}
    </>
  );
};

export default GuideCategoryPage;

export { getStaticProps, getStaticPaths };
