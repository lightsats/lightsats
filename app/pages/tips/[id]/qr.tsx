import { Loading } from "@nextui-org/react";
import { FlexBox } from "components/FlexBox";
import { useTip } from "hooks/useTip";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { getClaimUrl } from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import QRCode from "react-qr-code";

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
        <QRCode
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          viewBox={`0 0 256 256`}
          value={getClaimUrl(tip)}
        />
      </FlexBox>
    </div>
  );
};

export default TipQrPage;

export { getStaticProps, getStaticPaths };
