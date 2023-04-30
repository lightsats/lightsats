import { Loading } from "@nextui-org/react";
import { FlexBox } from "components/FlexBox";
import { LightningQRCode } from "components/LightningQRCode";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import QRCode from "react-qr-code";

const TipQrPage: NextPage = () => {
  const router = useRouter();
  const { code, mode } = router.query;

  if (!code || !mode) {
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
        <FlexBox style={{ maxWidth: "400px" }}>
          {mode === "QR" ? (
            <QRCode value={code as string} />
          ) : (
            <LightningQRCode value={code as string} />
          )}
        </FlexBox>
      </FlexBox>
    </div>
  );
};

export default TipQrPage;
