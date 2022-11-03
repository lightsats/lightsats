import { Loading, Spacer } from "@nextui-org/react";
import { ItemsList } from "components/items/ItemsList";
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

  return (
    <>
      <Head>
        <title>Lightsats⚡ - {category} Guide</title>
      </Head>
      <h4>{category}</h4>
      <ItemsList category={category} checkTippeeBalance={false} />
      <Spacer />
    </>
  );
};

export default GuideCategoryPage;
