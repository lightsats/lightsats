import { isAndroid, isIos, isMobile } from "lib/utils";
import React from "react";

export type DevicePlatform = {
  isMobile: boolean;
  isIos: boolean;
  isAndroid: boolean;
};

export function useDevicePlatform(): DevicePlatform {
  const [devicePlatform, setDevicePlatform] = React.useState<DevicePlatform>({
    isAndroid: false,
    isIos: false,
    isMobile: false,
  });

  React.useEffect(() => {
    setDevicePlatform({
      isAndroid: isAndroid(),
      isIos: isIos(),
      isMobile: isMobile(),
    });
  }, []);
  return devicePlatform;
}
