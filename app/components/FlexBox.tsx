import React from "react";

type FlexBoxProps = {
  style?: React.CSSProperties;
};

export function FlexBox({
  children,
  style,
}: React.PropsWithChildren<FlexBoxProps>) {
  return (
    <div
      style={{ flex: 1, display: "flex", flexDirection: "column", ...style }}
    >
      {children}
    </div>
  );
}
