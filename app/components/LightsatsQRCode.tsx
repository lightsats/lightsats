import React from "react";
import QRCode, { QRCodeProps } from "react-qr-code";

type LightsatsQRCodeProps = QRCodeProps;

function calculateLogoSize(
  value: string,
  height: string | number | undefined
): number {
  const isLargeUrl = value.startsWith("lnurl");
  return (
    (((typeof height === "string"
      ? height.indexOf("%") < 0
        ? parseInt(height)
        : 0
      : height) ?? 0) /
      (isLargeUrl ? 64 : 32)) *
    (isLargeUrl ? 7.8 : 4.78)
  );
}

export function LightsatsQRCode(props: LightsatsQRCodeProps) {
  const [logoSize, setLogoSize] = React.useState(
    calculateLogoSize(props.value, props.height)
  );

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!props.height && wrapperRef.current?.offsetHeight) {
      setLogoSize(
        calculateLogoSize(props.value, wrapperRef.current?.offsetHeight)
      );
    }
  }, [props.height, props.value]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: props.height ?? "100%",
        height: props.height ?? "100%",
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
          width: "100%",
          height: "100%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-192x192.png"
          alt=""
          width={logoSize}
          height={logoSize}
          style={{
            objectFit: "contain",
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
