import { NextImage } from "components/NextImage";
import React from "react";
import QRCode, { QRCodeProps } from "react-qr-code";

type LightsatsQRCodeProps = QRCodeProps;

export function LightsatsQRCode(props: LightsatsQRCodeProps) {
  const [logoSize, setLogoSize] = React.useState(0);
  const isLargeUrl = props.value.startsWith("lnurl");

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    setLogoSize(
      ((wrapperRef.current?.offsetHeight ?? 0) / (isLargeUrl ? 64 : 32)) *
        (isLargeUrl ? 7.8 : 6.8)
    );
  }, [isLargeUrl]);
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
      }}
      ref={wrapperRef}
    >
      <div
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: -logoSize * (isLargeUrl ? 0.0 : 0),
          marginLeft: -logoSize * (isLargeUrl ? 0.0 : 0),
        }}
      >
        <NextImage
          src="/icons/icon-192x192.png"
          width={logoSize}
          height={logoSize}
          objectFit="contain"
          style={{
            position: "absolute",
            zIndex: 1,
          }}
        />
      </div>
      <QRCode
        // FIXME: qr code props
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(props as any)}
        size={256}
        style={{
          height: "auto",
          maxWidth: "100%",
          width: "100%",
        }}
        viewBox={`0 0 256 256`}
      ></QRCode>
    </div>
  );
}
