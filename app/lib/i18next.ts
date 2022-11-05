import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// eslint-disable-next-line @typescript-eslint/ban-types
export type I18nPageStaticProps = {};

export const getStaticProps: GetStaticProps<I18nPageStaticProps> = async ({
  locale,
}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
    },
  };
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking", // can also be true or 'blocking'
  };
}
