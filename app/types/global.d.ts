import * as React from "react";

type LightningWidgetProps = {
  name: string;
  accent: string;
  to: string;
  image: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["lightning-widget"]: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & LightningWidgetProps,
        HTMLElement
      >;
    }
  }
}
