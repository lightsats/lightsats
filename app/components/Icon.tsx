import React from "react";

const iconProps: React.ComponentProps<"svg"> = {
  width: 24,
  height: 24,
  fill: "currentColor",
};

export const Icon = ({ children }: React.PropsWithChildren) =>
  React.cloneElement(children as React.ReactElement<unknown>, { ...iconProps });
