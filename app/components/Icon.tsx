import React from "react";

type IconProps = React.ComponentProps<"svg">;

const defaultIconProps: IconProps = {
  width: 24,
  height: 24,
  fill: "currentColor",
};

export const Icon = ({
  children,
  ...props
}: React.PropsWithChildren<IconProps>) =>
  React.cloneElement(children as React.ReactElement<unknown>, {
    ...defaultIconProps,
    ...props,
  });
