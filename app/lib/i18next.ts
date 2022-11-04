import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// eslint-disable-next-line @typescript-eslint/ban-types
type StaticProps = {};

export const getStaticProps: GetStaticProps<StaticProps> = async ({
  locale,
}) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en")),
  },
});

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking", // can also be true or 'blocking'
  };
}
