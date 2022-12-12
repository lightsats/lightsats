import { Loading } from "@nextui-org/react";
import { FlexBox } from "components/FlexBox";
import { LightsatsQRCode } from "components/LightsatsQRCode";
import { useTip } from "hooks/useTip";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { getClaimUrl } from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const TipQrPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: tip } = useTip(id as string);

  if (!tip) {
    return <Loading />;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "80vh",
      }}
    >
      <FlexBox
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LightsatsQRCode value={getClaimUrl(tip)} />
      </FlexBox>
    </div>
  );
};

export default TipQrPage;

export { getStaticProps, getStaticPaths };
