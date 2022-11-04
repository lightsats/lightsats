import { Loading, Spacer, Text } from "@nextui-org/react";
import { BackButton } from "components/BackButton";
import { ItemsList } from "components/items/ItemsList";
import { catalog } from "lib/items/catalog";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ItemCategory } from "types/Item";

const GuideCategoryPage: NextPage = () => {
  const router = useRouter();
  const { category: categoryString } = router.query;
  const category = categoryString as ItemCategory;

  if (!category) {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }

  const categoryItems = catalog[category];

  return (
    <>
      <Head>
        <title>Lightsats⚡ - {category} Guide</title>
      </Head>
      <h4>{category}</h4>
      {categoryItems?.length ? (
        <ItemsList category={category} checkTippeeBalance={false} />
      ) : (
        <>
          <Text css={{ textAlign: "center" }}>
            {
              "It looks like we haven't added any services to this category yet. Please check back soon."
            }{" "}
          </Text>
        </>
      )}
      <Spacer />
      <BackButton />
    </>
  );
};

export default GuideCategoryPage;
